import React, { useState, useEffect } from "react"
import Layout from "../components/layout"


import "./pages.css"

// Import JSON data directly
import peopleList from "../data/dudes.json"
import initialPairsList from "../data/initialPairs.json"


// Helper function to calculate time until next rotation
const getTimeUntilNextRotation = () => {
    const now = new Date();
    const nextWednesday = new Date(now);
    
    // Set to next Wednesday
    nextWednesday.setDate(now.getDate() + ((3 + 7 - now.getDay()) % 7));

    // Set to 7 PM Pacific Time
    nextWednesday.setHours(19, 0, 0, 0);

    // Adjust for Pacific Time (UTC-7 or UTC-8 depending on daylight saving)
    const pacificTimeOffset = -7; // or -8 during standard time
    const localOffset = now.getTimezoneOffset() / 60;
    const hourDifference = localOffset + pacificTimeOffset;
    nextWednesday.setHours(nextWednesday.getHours() + hourDifference);

    // If we're past this Wednesday's 7 PM, get next week's
    if (now > nextWednesday) {
    nextWednesday.setDate(nextWednesday.getDate() + 7);
    }

    // Calculate difference in milliseconds
    const diff = nextWednesday - now;

    // Convert to days, hours, minutes
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return { days, hours, minutes };
}

// Component for countdown display
const RotationCountdown = () => {
    const [timeLeft, setTimeLeft] = useState(getTimeUntilNextRotation());
    
    useEffect(() => {
      const timer = setInterval(() => {
        setTimeLeft(getTimeUntilNextRotation());
      }, 60000); // Update every minute
      
      return () => clearInterval(timer);
    }, []);
    
    return (
      <div className="rotation-countdown">
        <h3>Next rotation in: {timeLeft.days} days, {timeLeft.hours} hours, {timeLeft.minutes} minutes</h3>
        <p>(Every Wednesday at 7:00 PM Pacific Time)</p>
      </div>
    );
  }

// Generate pairs with rotation by one person each week
const generatePairs = (people, initialPairs = []) => {
    // Get current week number since epoch to determine rotation
    const now = new Date();
    // Note (androo): for testing
    // const now = new Date(2025, 2, 27);
    // const now = new Date(2025, 3, 3);

    // Note (androo): we started doing this 3/19/2025)
    const startDate = new Date(2025, 2, 19);
    const msPerWeek = 7 * 24 * 60 * 60 * 1000;
    const weekNumber = Math.floor((now - startDate) / msPerWeek);

    // Create a copy of the people array to work with
    let availablePeople = [...people];

    // Start with fixed pairs
    let pairs = [];
    if (weekNumber === 0) {
        pairs = [...initialPairs];
        // Remove people who are in fixed pairs
        initialPairs.forEach(pair => {
            availablePeople = availablePeople.filter(person => 
                !pair.includes(person)
            );
        });
    }

    // If we have fewer than 2 people available, we need to break up a fixed pair
    // to avoid having a single person alone
    if (availablePeople.length === 1 && initialPairs.length > 0) {
        // Take a person from the last initial pair to pair with our single person
        const lastInitialPair = initialPairs.pop();
        const personFromInitial = lastInitialPair[0];
        const remainingInitial = lastInitialPair.slice(1);

        // Create a new pair with our single person and one from the fixed pair
        pairs.push([availablePeople[0], personFromInitial]);

        // If there are still people left in the initial pair, add them back
        if (remainingInitial.length > 0) {
            initialPairs.push(remainingInitial);
        }

        return pairs;
    }

    // If no one is available, just return initial pairs
    if (availablePeople.length === 0) {
        return pairs;
    }

    // Implement rotation by shifting the array based on week number
    const rotationOffset = weekNumber % availablePeople.length;

    // Create a rotated array
    const rotatedPeople = [
        ...availablePeople.slice(rotationOffset),
        ...availablePeople.slice(0, rotationOffset)
    ];

    // Check if we have an odd number of people
    const hasOddPerson = rotatedPeople.length % 2 === 1;
    
    // If we have an odd number, identify who will be the odd person out
    let oddPersonOut = null;
    if (hasOddPerson) {
        oddPersonOut = rotatedPeople[rotatedPeople.length - 1];
        
        // Find who this person was paired with last week (if not week 0)
        let lastWeekPartners = [];
        if (weekNumber > 0) {
            // Calculate last week's rotation
            const lastWeekOffset = (weekNumber - 1) % availablePeople.length;
            const lastWeekRotated = [
                ...availablePeople.slice(lastWeekOffset),
                ...availablePeople.slice(0, lastWeekOffset)
            ];
            
            // Find the odd person's position in last week's rotation
            const lastWeekPosition = lastWeekRotated.indexOf(oddPersonOut);
            
            // If they were in a pair
            if (lastWeekPosition % 2 === 0 && lastWeekPosition + 1 < lastWeekRotated.length) {
                lastWeekPartners.push(lastWeekRotated[lastWeekPosition + 1]);
            } else if (lastWeekPosition % 2 === 1) {
                lastWeekPartners.push(lastWeekRotated[lastWeekPosition - 1]);
            }
            
            // If they were in a group of 3 last week
            if (lastWeekRotated.length % 2 === 1 && 
                lastWeekPosition === lastWeekRotated.length - 1) {
                // They were the odd person out last week too
                // They were added to the last pair
                lastWeekPartners.push(lastWeekRotated[lastWeekRotated.length - 2]);
                lastWeekPartners.push(lastWeekRotated[lastWeekRotated.length - 3]);
            }
        }
        
        // Create pairs, avoiding putting the odd person with their previous partners
        const normalPairs = [];
        for (let i = 0; i < rotatedPeople.length - 1; i += 2) {
            normalPairs.push([rotatedPeople[i], rotatedPeople[i + 1]]);
        }
        
        // Find the best pair to add the odd person to
        let bestPairIndex = normalPairs.length - 1; // Default to last pair
        
        for (let i = 0; i < normalPairs.length; i++) {
            // Check if neither person in this pair was paired with the odd person last week
            if (!lastWeekPartners.includes(normalPairs[i][0]) && 
                !lastWeekPartners.includes(normalPairs[i][1])) {
                bestPairIndex = i;
                break; // Found a good pair, use it
            }
        }
        
        // Add the odd person to the best pair
        normalPairs[bestPairIndex].push(oddPersonOut);
        pairs = [...pairs, ...normalPairs];
    } else {
        // Even number of people - just create pairs normally
        for (let i = 0; i < rotatedPeople.length; i += 2) {
            pairs.push([rotatedPeople[i], rotatedPeople[i + 1]]);
        }
    }

    return pairs;
}

// Expose the function to the window object for testing
if (typeof window !== 'undefined') {
    window.testGeneratePairs = (people, initialPairs = []) => {
      return generatePairs(people, initialPairs);
    }
  }

const PrayerPartners = () => {
    // Extract people and initial pairs from the imported JSON
    const people = peopleList.map(person => person.name);
    const initialPairs = initialPairsList.map(item => item.pair);
    
    // Generate the current pairs
    const currentPairs = generatePairs(people, initialPairs);

    // Format the pairs into a human-readable string
    const readablePairs = currentPairs
        .map((pair, index) => `Group ${index + 1}: ${pair.join(", ")}`)
        .join("\n");

    // Function to copy the formatted pairs to the clipboard
    const copyToClipboard = () => {
        navigator.clipboard.writeText(readablePairs)
            .then(() => alert("Copied list of partners!!"))
            .catch(err => console.error("Failed to copy text: ", err));
    };

    return (
        <Layout>
            <div className="prayer-partners-page">                
                <div className="rotation-countdown-container">
                    <RotationCountdown />
                </div>
                
                <h2 className="partners-heading">Current Prayer Partners</h2>

                <div className="copy-button-container">
                    <button onClick={copyToClipboard} className="copy-button">
                        Copy Partners
                    </button>
                </div>
                <div className="partners-grid">
                    {currentPairs.map((pair, index) => (
                        <div key={index} className="partner-pair">
                            <h3>Group {index + 1}</h3>
                            <ul>
                                {pair.map((person, personIndex) => (
                                    <li key={personIndex}>{person}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </Layout>
    )
}

export default PrayerPartners;