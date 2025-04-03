import React, { useState, useEffect } from "react"
import Header from "../components/header"
import Footer from "../components/footer"

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClipboard } from '@fortawesome/free-solid-svg-icons';


import "./pages.css"

// Import JSON data directly
import peopleList from "../data/dudes.json"

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

// Generate pairs using a round-robin tournament scheduling algorithm
const generatePairs = (people) => {
    // Get current week number since epoch to determine rotation
    const now = new Date();
    // For testing:
    // const now = new Date(2025, 2, 27);
    // const now = new Date(2025, 3, 3);
    // const now = new Date(2025, 3, 10);
    // const now = new Date(2025, 3, 17);

    // Note: we started doing this 3/19/2025 at 7:00 PM Pacific Time
    const startDate = new Date(2025, 2, 19);
    startDate.setHours(19, 0, 0, 0);
    const msPerWeek = 7 * 24 * 60 * 60 * 1000;
    const weekNumber = Math.floor((now - startDate) / msPerWeek);

    // If we have 0 or 1 people, just return an empty array or single-person array
    if (people.length <= 1) {
        return people.length === 0 ? [] : [[people[0]]];
    }
    
    // Use round-robin tournament scheduling algorithm
    return roundRobinPairing([...people], weekNumber);
};

// Implement round-robin tournament scheduling
const roundRobinPairing = (people, weekNumber) => {
    // For odd number of participants, we'll handle the last person specially
    const isOdd = people.length % 2 === 1;
    let extraPerson = null;
    
    if (isOdd) {
        // Remove the last person temporarily
        extraPerson = people.pop();
    }
    
    const n = people.length;
    // For n participants, we have (n-1) rounds
    const round = weekNumber % (n - 1);
    
    // Create a copy of the people array
    let positions = [...people];
    
    // Rotate the array based on the round number
    if (round > 0) {
        const firstPerson = positions[0];
        const rotated = positions.slice(1);
        
        // Rotate the remaining people
        for (let i = 0; i < round; i++) {
            rotated.push(rotated.shift());
        }
        
        positions = [firstPerson, ...rotated];
    }
    
    // Create pairs
    const pairs = [];
    for (let i = 0; i < n / 2; i++) {
        pairs.push([positions[i], positions[n - 1 - i]]);
    }
    
    // If we had an odd number of participants, add the extra person
    if (isOdd && extraPerson) {
        // Use a prime number-based rotation to avoid patterns
        // This creates a sequence that doesn't repeat until lcm(n/2, prime)
        const prime = 7; // A prime number that's not related to our group sizes
        const pairIndex = (weekNumber * prime) % pairs.length;
        pairs[pairIndex].push(extraPerson);
    }
    
    return pairs;
};

// Expose the function to the window object for testing
if (typeof window !== 'undefined') {
    window.testGeneratePairs = (people, initialPairs = []) => {
      return generatePairs(people, initialPairs);
    }
  }

const PrayerPartners = () => {
    // Extract people and initial pairs from the imported JSON
    const people = peopleList.map(person => person.name);
    
    // Generate the current pairs
    const currentPairs = generatePairs(people);
    
    // State for toggling the schedule visibility
    const [showSchedule, setShowSchedule] = useState(false);
    
    // Calculate current week number
    const now = new Date();
    const startDate = new Date(2025, 2, 19); // March 19, 2025
    const msPerWeek = 7 * 24 * 60 * 60 * 1000;
    const currentWeekNumber = Math.floor((now - startDate) / msPerWeek) + 1; // +1 for 1-based week number
    
    // Calculate date ranges for each week
    const getWeekDateRange = (weekNumber) => {
        const weekStart = new Date(startDate);
        weekStart.setDate(weekStart.getDate() + (weekNumber * 7));
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        
        // Format dates as MM/DD/YYYY
        const formatDate = (date) => {
            return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
        };
        
        return `${formatDate(weekStart)} - ${formatDate(weekEnd)}`;
    };
    
    // Generate all 22 weeks of schedules with date ranges
    const allWeeksSchedule = Array.from({ length: 22 }, (_, i) => ({
        week: i,
        dateRange: getWeekDateRange(i),
        pairs: roundRobinPairing([...people], i),
        isCurrent: i === currentWeekNumber - 1 // Check if this is the current week
    }));

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
        <div>
            <Header />
            <div className="prayer-partners-page">                
                <div className="rotation-countdown-container">
                    <RotationCountdown />
                </div>

                <div className="partners-heading-container">
                    <h2 className="partners-heading">Current Prayer Partners</h2>
                    <div className="copy-icon-wrapper" title="Copy partners to clipboard">
                        <FontAwesomeIcon 
                        icon={faClipboard} 
                        className="copy-icon" 
                        onClick={copyToClipboard}
                        aria-label="Copy partners to clipboard"
                        />
                    </div>
                </div>
                
                <div className="week-indicator">
                    <p><u>Week {currentWeekNumber}</u></p>
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
                
                <div className="schedule-toggle">
                    <button 
                        onClick={() => setShowSchedule(!showSchedule)}
                        className="toggle-button"
                    >
                        {showSchedule ? "Hide Full Schedule" : "Show Full Schedule"}
                    </button>
                    
                    {showSchedule && (
                        <div className="full-schedule">
                            <h2>Complete 22-Week Schedule</h2>
                            <div className="weeks-container">
                                {allWeeksSchedule.map((weekData) => (
                                    <div key={weekData.week} className={`week-schedule ${weekData.isCurrent ? 'current-week' : ''}`}>
                                        <h3>
                                            Week {weekData.week + 1}
                                            {weekData.isCurrent && <span className="current-indicator"> (current)</span>}
                                        </h3>
                                        <p className="date-range">{weekData.dateRange}</p>
                                        <div className="week-pairs">
                                            {weekData.pairs.map((pair, pairIndex) => (
                                                <div key={pairIndex} className="schedule-pair">
                                                    <h4>Group {pairIndex + 1}</h4>
                                                    <ul>
                                                        {pair.map((person, personIndex) => (
                                                            <li key={personIndex}>{person}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    )
}

export default PrayerPartners;