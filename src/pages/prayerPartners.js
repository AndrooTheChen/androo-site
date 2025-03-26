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

// Generate pairs with rotation that avoids duplicate pairings
const generatePairs = (people, initialPairs = []) => {
    // Get current week number since epoch to determine rotation
    const now = new Date();
    // Note (androo): for testing
    // const now = new Date(2025, 2, 27);
    // const now = new Date(2025, 3, 3);
    // const now = new Date(2025, 3, 10);
    // const now = new Date(2025, 3, 17);

    // Note (androo): we started doing this 3/19/2025)
    const startDate = new Date(2025, 2, 19);
    const msPerWeek = 7 * 24 * 60 * 60 * 1000;
    const weekNumber = Math.floor((now - startDate) / msPerWeek) + 1;
    // console.log(`Week number: ${weekNumber}`)

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
        
        // For week 0, just pair the remaining people sequentially
        for (let i = 0; i < availablePeople.length; i += 2) {
            if (i + 1 < availablePeople.length) {
                pairs.push([availablePeople[i], availablePeople[i + 1]]);
            } else if (pairs.length > 0) {
                // Add the last person to the last pair if odd number
                pairs[pairs.length - 1].push(availablePeople[i]);
            }
        }
        
        return pairs;
    }
    
    // For weeks after the first week, implement a perfect matching algorithm
    // This ensures each person meets with every other person exactly once before repeating
    
    // If the number of people is even, we can use a "round robin tournament" algorithm
    // If odd, we'll handle that separately
    
    const isEven = availablePeople.length % 2 === 0;
    let rotatedPeople = [...availablePeople];
    
    if (isEven) {
        // For even number of people, we can use the circle method
        // Fix one person (at index 0) and rotate the rest
        const fixedPerson = rotatedPeople[0];
        const otherPeople = rotatedPeople.slice(1);
        
        // Calculate which rotation to use based on week number
        // We have (n-1) possible pairings for n people
        const rotationIndex = (weekNumber - 1) % (availablePeople.length - 1);
        
        // Rotate the array of other people
        for (let i = 0; i < rotationIndex; i++) {
            otherPeople.unshift(otherPeople.pop());
        }
        
        // Create pairs
        pairs = [];
        pairs.push([fixedPerson, otherPeople[0]]);
        
        for (let i = 1; i < otherPeople.length; i += 2) {
            if (i + 1 < otherPeople.length) {
                pairs.push([otherPeople[i], otherPeople[i + 1]]);
            }
        }
    } else {
        // For odd number of people, one person sits out each week
        // We'll use a modified circle method
        
        // Calculate which rotation to use
        const rotationIndex = (weekNumber - 1) % availablePeople.length;
        
        // Rotate the entire array
        for (let i = 0; i < rotationIndex; i++) {
            rotatedPeople.unshift(rotatedPeople.pop());
        }
        
        // The person at the last position sits out this week
        const sittingOut = rotatedPeople.pop();
        
        // Create pairs with the remaining people
        pairs = [];
        for (let i = 0; i < rotatedPeople.length; i += 2) {
            if (i + 1 < rotatedPeople.length) {
                pairs.push([rotatedPeople[i], rotatedPeople[i + 1]]);
            } else {
                // If we have an odd number after removing the sitting out person,
                // add the last person to a group of 3
                pairs[0].push(rotatedPeople[i]);
            }
        }
        
        // If we have at least one pair, add the sitting out person to the first pair
        // This creates a group of 3
        if (pairs.length > 0) {
            pairs[pairs.length - 1].push(sittingOut);
        } else {
            // Edge case: if we only have 1 person after all filtering
            pairs.push([sittingOut]);
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

    return (
        <Layout>
            <div className="prayer-partners-page">                
                <div className="rotation-countdown-container">
                    <RotationCountdown />
                </div>
                
                <h2 className="partners-heading">Current Prayer Partners</h2>
                
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