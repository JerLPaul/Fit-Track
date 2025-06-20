import styles from "./Groups.module.css";
import { useEffect, useState } from "react";
import { supabase } from "../../utils/SupabaseClient/SupabaseClient";

export default function Groups() {
    const [days, setDays] = useState([]); // State to store the fetched data

    const fetchDays = async () => {
        try {
            const { data, error } = await supabase
                .from("Day")
                .select("*"); // Fetch initial data

            if (error) {
                console.error("Error fetching data from Supabase:", error.message);
                return;
            }

            const parsedData = data.map((day) => {
                const ParsedDay = {};
                ParsedDay.id = day.id;
                ParsedDay.date = day.date;

                // Parse food_list from JSON string to array
                try {
                    const foodList = JSON.parse(day.food_list); // Parse food_list JSON string
                    if (Array.isArray(foodList)) {
                        ParsedDay.food_list = foodList; // Set parsed food_list if it's an array
                    } else {
                        console.error("food_list is not an array:", foodList);
                        ParsedDay.food_list = []; // Fallback to empty array
                    }
                } catch (e) {
                    console.error("Error parsing food_list:", e);
                    ParsedDay.food_list = []; // Fallback to empty array
                }

                return ParsedDay;
        });

        console.log("Fetched days:", parsedData);
        setDays(parsedData); // Set the parsed data to state
            
        } catch (err) {
            console.error("Unexpected error:", err);
        }
    };

    useEffect(() => {
        // Fetch initial data
        fetchDays();

        // Subscribe to realtime changes using channels
        const channel = supabase
            .channel("public-db-changes") // Channel name can be any string except 'realtime'
            .on(
                "postgres_changes",
                {
                    event: "*", // Listen to all events (INSERT, UPDATE, DELETE)
                    schema: "public", // Specify the schema
                    table: "Day", // Specify the table
                },
                (payload) => {
                    console.log("Realtime change received:", payload);

                    // Update the state based on the change type
                    if (payload.eventType === "INSERT") {
                        setDays((prevDays) => [...prevDays, payload.new]); // Add new row
                    } else if (payload.eventType === "UPDATE") {
                        setDays((prevDays) =>
                            prevDays.map((day) =>
                                day.id === payload.new.id ? payload.new : day
                            )
                        ); // Update existing row
                    } else if (payload.eventType === "DELETE") {
                        setDays((prevDays) =>
                            prevDays.filter((day) => day.id !== payload.old.id)
                        ); // Remove deleted row
                    }
                }
            )
            .subscribe();

        // Cleanup subscription on component unmount
        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return (
        <div>
            <h1>Groups</h1>
            {days.length > 0 ? (
                <div className={styles.contentContainer}>
                    {days.map((day) => (
                        <div key={day.id} className={styles.groupItem}>
                            <h2>{day.date}</h2>
                            {day.food_list && day.food_list.length > 0 ? (
                                <ul className={styles.foodList}>
                                    {day.food_list.map((item, index) => (
                                        <li key={index} className={styles.foodItem}>
                                            <h3>{item.name}</h3>
                                            <ul>
                                                {item.description.map((desc, descIndex) => (
                                                    <li key={descIndex}>{desc}</li>
                                                ))}
                                            </ul>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No food items available</p>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <p>No groups available</p>
            )}
        </div>
    );
}