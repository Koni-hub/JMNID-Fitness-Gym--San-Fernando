import { useUser } from '../../context/UserContext';
import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import axios from 'axios';

const localizer = momentLocalizer(moment);

const MyWorkouts = () => {
    const user = useUser();
    const [dailyPlans, setDailyPlans] = useState({});
    const [events, setEvents] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);


    const [workouts, setWorkouts] = useState([]);
    const [meals, setMeals] = useState([]);

    const fetchPlans = useCallback(async () => {
        const userId = user?.user?._id;

        if (!userId) {
            console.error("Error: Invalid user ID.");
            return;
        }

        console.log('Data Fetch: ', { userId });

        try {
            const workoutResponse = await fetch(`http://localhost:4000/workout-planner/${userId}/plan`);
            const workoutData = await workoutResponse.json();

            const mealResponse = await fetch(`http://localhost:4000/meal-planner/${userId}/plan`);
            const mealData = await mealResponse.json();

            if (!workoutData || !mealData ||
                (Array.isArray(workoutData.workoutPlan) && workoutData.workoutPlan.length === 0) ||
                (Array.isArray(mealData.mealPlan) && mealData.mealPlan.length === 0)) {
                throw new Error('No workout or meal plans found.');
            }

            setDailyPlans({
                workoutPlan: workoutData.workoutPlan || null,
                mealPlan: mealData.mealPlan || null,
            });

            const newEvents = [];

            if (workoutData.workoutPlan?.workouts) {
                workoutData.workoutPlan.workouts.forEach((workout) => {
                    newEvents.push({
                        start: new Date(),
                        end: new Date(),
                        title: `Workout: ${workout.title}`,
                    });
                });
            }

            if (mealData.mealPlan) {
                mealData.mealPlan.forEach((mealPlan) => {
                    const weekDate = new Date(mealPlan.week);
                    mealPlan.meals.forEach((meal) => {
                        newEvents.push({
                            start: weekDate,
                            end: weekDate,
                            title: `Meal: ${meal.mealName} (${meal.day})`,
                        });
                    });
                });
            }

            setEvents(newEvents);
        } catch (error) {
            console.error('Error fetching plans:', error);
        }
    }, [user, setDailyPlans]);

    useEffect(() => {
        fetchPlans();
    }, [fetchPlans]);

    const fetchPlansForDate = async (date) => {
        const userId = user?.user?._id;

        if (!date) {
            console.error("Error: Invalid date passed to fetchPlansForDate.");
            return;
        }

        const selectedDateISO = moment(date).format('YYYY-MM-DD');
        console.log('Data Fetch: ', {
            userId: userId,
            selectedDate: selectedDateISO,
        });

        try {
            const workoutResponse = await fetch(`http://localhost:4000/workout-planner/${userId}?week=${selectedDateISO}`);
            const workoutData = await workoutResponse.json();

            const mealResponse = await fetch(`http://localhost:4000/meal-planner/${userId}?week=${selectedDateISO}`);
            const mealData = await mealResponse.json();

            if (!workoutData || !mealData ||
                (Array.isArray(workoutData.workoutPlan) && workoutData.workoutPlan.length === 0) ||
                (Array.isArray(mealData.mealPlan) && mealData.mealPlan.length === 0)) {
                throw new Error('No workout or meal plans found for this date.');
            }

            setDailyPlans((prev) => ({
                ...prev,
                [selectedDateISO]: {
                    workoutPlan: workoutData.workoutPlan || null,
                    mealPlan: mealData.mealPlan || null,
                },
            }));
        } catch (error) {
            console.error('Error fetching plans:', error);
        }
    };

    const handleSelectSlot = (slotInfo) => {
        const selectedDate = slotInfo.start;
        console.log('Slot Info Start:', selectedDate);
        setSelectedDate(selectedDate);
        fetchPlansForDate(selectedDate);
        setIsModalOpen(true);
    };

    const closeModal = (e) => {
        e.stopPropagation();
        setIsModalOpen(false);
    };

    const handleModalBackgroundClick = (e) => {
        if (e.target === e.currentTarget) {
            setIsModalOpen(false);
        }
    };

    const addScheduleHistory = async (date) => {
        const userId = user?.user?._id;
    
        if (!date) {
            console.error("Error: Invalid date passed to addScheduleHistory.");
            return;
        }
    
        const selectedDateISO = moment(date).format('YYYY-MM-DD');
        console.log('Data Fetch: ', {
            userId: userId,
            selectedDate: selectedDateISO,
        });

        const currentDate = new Date().toLocaleDateString('en-CA');
        console.log("Current Date:", currentDate);
        console.log("Select Date:", selectedDateISO);

        if (selectedDateISO === currentDate) {
            alert('You can now accomplish this task');
        
            // eslint-disable-next-line no-restricted-globals
            const userConfirmed = confirm("Click OK to continue, or Cancel to not proceed.");
            
            if (userConfirmed) {
                try {
                    const workoutResponse = await fetch(`http://localhost:4000/workout-planner/${userId}?week=${selectedDateISO}`);
                    const workoutData = await workoutResponse.json();
            
                    const mealResponse = await fetch(`http://localhost:4000/meal-planner/${userId}?week=${selectedDateISO}`);
                    const mealData = await mealResponse.json();
            
                    if (!workoutData || !mealData || 
                        (Array.isArray(workoutData.workoutPlan) && workoutData.workoutPlan.length === 0) || 
                        (Array.isArray(mealData.mealPlan) && mealData.mealPlan.length === 0)) {
                        throw new Error('No workout or meal plans found for this date.');
                    }
            
                    const workoutTitles = workoutData.workoutPlan.workouts.map(workout => workout.title);
                    console.log('Workout:', workoutTitles);
                    setWorkouts(workoutTitles);
            
                    const mealNames = mealData.mealPlan.meals.map(meal => meal.mealName);
                    console.log('Meals:', mealNames);
                    setMeals(mealNames);
            
                    console.log('Workout UseState', workouts);
                    console.log('Meals UseState', meals);
            
                    const response = await axios.post('/task-history', {
                        userId: userId,
                        date: selectedDateISO,
                        workouts: workoutTitles,
                        meals: mealNames,
                    });
            
                    console.log("Data: ", response);
                    alert('Successfully accomplished the task');
                    setIsModalOpen(false);
            
                } catch (error) {
                    alert('Failed to log the task');
                    setIsModalOpen(false);
                    console.error('Error fetching plans or posting task history:', error);
                }
            } else {
                alert('Task continuation canceled.');
                setIsModalOpen(false);
            }
        } else if (selectedDate !== currentDate) {
            alert('You cannot accomplish this task; you need to meet the day before you can complete it.');
            setIsModalOpen(false)
        }
    }

    const removeSchedule = () => {
        setIsModalOpen(false);
    }

    return (
        <div className="text-white min-h-screen flex flex-col items-center p-6">
            <h1 className='text-white text-3xl font-bold mb-4'>My Workouts and Meal Plans</h1>
            <div className="bg-gray-800 rounded-lg shadow-lg p-4 mb-6 w-full max-w-3x2">
                <Calendar
                    localizer={localizer}
                    selectable
                    views={['month']}
                    defaultView="month"
                    onSelectSlot={handleSelectSlot}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: 500 }}
                    className="rounded-lg"
                />
            </div>

            {isModalOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
                    onClick={handleModalBackgroundClick}
                >
                    <div className="bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-3xl relative">
                        <button
                            className="absolute top-2 right-4 text-white"
                            onClick={closeModal}
                        >
                            X
                        </button>
                        <h2 className="text-white text-xl font-semibold mb-4">
                            Plans for {moment(selectedDate).format('MMMM Do YYYY')}
                        </h2>
                        <div className="mb-4">
                            <h1 className="text-white mb-5">Workout Plan</h1>
                            {dailyPlans[moment(selectedDate).format('YYYY-MM-DD')]?.workoutPlan ? (
                                <div className="text-gray-200">
                                    {dailyPlans[moment(selectedDate).format('YYYY-MM-DD')].workoutPlan.workouts.map((workout, index) => (
                                        <div key={index} className="text-gray-200">
                                            <p>Title: <b>{workout.title}</b></p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-400">No workout plan found for this day.</p>
                            )}
                        </div>
                        <hr />
                        <div>
                            <h1 className="text-white mb-5">Meal Plan</h1>
                            {dailyPlans[moment(selectedDate).format('YYYY-MM-DD')]?.mealPlan ? (
                                <div>
                                    {dailyPlans[moment(selectedDate).format('YYYY-MM-DD')].mealPlan.meals.map((meal, index) => (
                                        <div key={index} className="text-gray-200">
                                            <p>Name: <b>{meal.mealName}</b></p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-400">No meal plan found for this day.</p>
                            )}
                        </div>
                        <div className="flex gap-2 mt-2 float-right">
                            <button onClick={() => removeSchedule()} className='bg-red-500 px-5 py-2 rounded-lg text-white'>Remove</button>
                            <button onClick={() => addScheduleHistory(selectedDate)} className='bg-primary px-10 py-2 rounded-lg text-white'>Done</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyWorkouts;