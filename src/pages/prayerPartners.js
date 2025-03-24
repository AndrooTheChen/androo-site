import React, { useState, useEffect } from "react"
import Layout from "../components/layout"


import "./pages.css"

// Import JSON data directly
import peopleList from "../data/dudes.json"
import fixedPairsList from "../data/initialPairs.json"


// Helper function to calculate time until next rotation
const getTimeUntilNextRotation = () => {
    // ... existing code ...
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
const generatePairs = (people, fixedPairs = []) => {
  // Get current week number since epoch to determine rotation
  const now = new Date();
  const startDate = new Date(1970, 0, 1);
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const weekNumber = Math.floor((now - startDate) / msPerWeek);
  
  // Create a copy of the people array to work with
  let availablePeople = [...people];
  
  // Start with fixed pairs
  let pairs = [...fixedPairs];
  
  // Remove people who are in fixed pairs
  fixedPairs.forEach(pair => {
    availablePeople = availablePeople.filter(person => 
      !pair.includes(person)
    );
  });
  
  // If we have fewer than 2 people available, we need to break up a fixed pair
  // to avoid having a single person alone
  if (availablePeople.length === 1 && fixedPairs.length > 0) {
    // Take a person from the last fixed pair to pair with our single person
    const lastFixedPair = pairs.pop();
    const personFromFixed = lastFixedPair[0];
    const remainingFixed = lastFixedPair.slice(1);
    
    // Create a new pair with our single person and one from the fixed pair
    pairs.push([availablePeople[0], personFromFixed]);
    
    // If there are still people left in the fixed pair, add them back
    if (remainingFixed.length > 0) {
      pairs.push(remainingFixed);
    }
    
    return pairs;
  }
  
  // If no one is available, just return fixed pairs
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
  
  // Create pairs, ensuring no one is left alone
  for (let i = 0; i < rotatedPeople.length; i += 2) {
    if (i + 1 < rotatedPeople.length) {
      // Normal case: create a pair
      pairs.push([rotatedPeople[i], rotatedPeople[i + 1]]);
    } else {
      // Last person - add to the last created pair to make a group of 3
      if (pairs.length > 0) {
        pairs[pairs.length - 1].push(rotatedPeople[i]);
      } else if (fixedPairs.length > 0) {
        // If we only have fixed pairs, add to the last fixed pair
        pairs[pairs.length - 1].push(rotatedPeople[i]);
      } else {
        // Edge case: only one person total and no fixed pairs
        // This shouldn't happen with the checks above, but just in case
        console.warn("Warning: Could not avoid having a single-person group");
        pairs.push([rotatedPeople[i]]);
      }
    }
  }
  
  return pairs;
}

const PrayerPartners = () => {
    // Extract people and fixed pairs from the imported JSON
    const people = peopleList.map(person => person.name);
    const fixedPairs = fixedPairsList.map(item => item.pair);
    
    // Generate the current pairs
    const currentPairs = generatePairs(people, fixedPairs);

    return (
        <Layout>
            <div className="prayer-partners-page">
                <h1>Prayer Partners</h1>
                
                <RotationCountdown />
                
                <div className="partners-list">
                <h2>Current Prayer Partners</h2>
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