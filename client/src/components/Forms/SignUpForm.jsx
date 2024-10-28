//! MUlTI FORM SIGN UP
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from "react-hook-form";
import axios from 'axios';
import { FaEye, FaEyeSlash } from 'react-icons/fa6';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import BodyGoals from '../MultiForms/BodyGoals';
import BodyAssessment from '../MultiForms/BodyAssessment';

const MultiStepProgressBar = ({ activeTab, setActiveTab }) => {
  const tabs = ['assessment', 'body-goals', 'signup'];

  return (
    <div className="absolute top-0 left-0 mt-4 ml-4">
      <div className="relative">
        <div className="flex items-center mb-2">
          {tabs.map((tab, index) => (
            <React.Fragment key={tab}>
              <button
                onClick={() => setActiveTab(index)}
                className={`px-4 py-2 transition-colors duration-200
                  ${activeTab === index ? 'bg-primary text-white' : 'bg-gray-200'}
                  ${index === 0 ? 'rounded-l-lg' : ''} 
                  ${index === tabs.length - 1 ? 'rounded-r-lg' : ''}`}
              >
                {tab.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </button>
              {index < tabs.length - 1 && (
                <div className={`flex-1 h-1 ${activeTab > index ? 'bg-primary' : 'bg-gray-300'}`}></div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-gray-300">
          <div
            className="h-full bg-primary"
            style={{ width: `${(activeTab + 1) / tabs.length * 100}%` }} // Calculate width based on active tab
          />
        </div>
      </div>
    </div>
  );
};

const SignUpForm = () => {
  const { register, handleSubmit, formState: { errors }, getValues, trigger } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [assessmentData, setAssessmentData] = useState({
    height: '',
    weight: '',
    bodyType: '',
    bmi: ''
  });
  const [selectedGoal, setSelectedGoal] = useState('');

  const handleAssessmentChange = (data) => {
    setAssessmentData(data);
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const navigate = useNavigate();

  useEffect(() => {
    const verifyCookie = async () => {
      try {
        const { data } = await axios.post("/auth", {}, { withCredentials: true });
        if (data?.status) {
          navigate(-1);
        }
      } catch (error) {
        console.error('Cookie verification failed:', error);
      }
    };
    verifyCookie();
  }, [navigate]);

  const sendVerificationEmail = async (email) => {
    try {
      setIsLoading(true);
      const response = await axios.post('/verify-email/send-verification-code', { email });
      localStorage.setItem('verificationCode', response.data.code);
      localStorage.setItem('userEmail', response.data.email);
      alert('Verification code sent successfully! Please check your email.');
    } catch (error) {
      console.error('Error sending verification email:', error);
      alert('Error sending verification email. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (enteredCode) => {
    const storedCode = localStorage.getItem('verificationCode');
    if (storedCode === enteredCode) {
      setIsEmailVerified(true);
      alert('Successfully verified email');
      localStorage.removeItem('verificationCode');
    } else {
      alert('Invalid code entered. Please check your email for the correct verification code.');
    }
  };

  const handleSendCode = async () => {
    const isValid = await trigger("email");
    if (isValid) {
      await sendVerificationEmail(getValues('email'));
      setIsCodeSent(true);
    }
  };  

  const onSubmit = async (data) => {
    if (!isEmailVerified) {
      setError("Please verify your email");
      return;
    }

    if (data.password !== data.cpassword) {
      setError("Passwords do not match.");
      return;
    }

     // Validate fitness goals and body assessment
    if (!selectedGoal) {
      setError("Please select at least one fitness goal.");
      return;
    }

    if (!assessmentData || !assessmentData.height || !assessmentData.weight || !assessmentData.bmi || !assessmentData.bodyType) {
      setError("Please complete the body assessment.");
      return;
    }

    const registrationData = {
      username: data.username,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
      cpassword: data.cpassword,
      fitness_goals: [selectedGoal],
      body_assessment: {
        height: assessmentData.height,
        weight: assessmentData.weight,
        bmi: assessmentData.bmi,
      },
      body_type: assessmentData.bodyType,
    };

    try {
      setIsLoading(true);
      const response = await axios.post('/auth/register', registrationData, { 
        withCredentials: true 
      });
      if (response.data) {
        navigate('/client');
        window.location.reload();
      }
    } catch (error) {
      console.error('Registration failed:', error);
      setError(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const renderSignUpForm = () => (
    <form className="w-full md:w-[600px] bg-white-light px-6 py-3 grid gap-4 rounded-xl" 
          onSubmit={handleSubmit(onSubmit)}>
      {/* Username field */}
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="text-black w-full text-2xl" htmlFor="username">
            Username
          </label>
          <input
            className="border-2 border-primary w-full px-6 py-3 rounded-xl"
            {...register('username', {
              required: "Username is required",
              maxLength: {
                value: 30,
                message: "Username must be at most 30 characters long"
              }
            })}
            id="username"
            type="text"
            placeholder="Username"
          />
          {errors.username && (
            <span className="text-red-600 text-sm">{errors.username.message}</span>
          )}
        </div>
      </div>

      {/* Email and verification section */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="md:w-5/6 w-full">
          <label className="text-black w-full text-2xl" htmlFor="email">
            Email
          </label>
          <input
            className="border-2 border-primary w-full px-4 py-3 rounded-xl"
            {...register('email', {
              required: "Email is required",
              pattern: {
                value: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,
                message: 'Invalid email format'
              }
            })}
            id="email"
            type="text"
            placeholder="Email"
          />
          {errors.email && (
            <span className="text-red-600 text-sm">{errors.email.message}</span>
          )}
        </div>
        <div className="md:w-1/4 w-full">
          <button
            type="button"
            onClick={handleSendCode}
            className="w-full border-2 border-primary bg-primary text-white px-4 py-3 rounded mt-4 md:mt-10"
            disabled={isLoading}
          >
            {isLoading ? (
              <AiOutlineLoading3Quarters className="mx-auto text-[24px] animate-spin" />
            ) : (
              "Send Code"
            )}
          </button>
        </div>
      </div>

      {/* Verification code section */}
      {isCodeSent && (
        <div className="flex flex-col md:flex-row gap-2 mt-2">
          <div className="w-full">
            <label className="text-black w-full text-2xl" htmlFor="verificationCode">
              Verification Code
            </label>
            <input
              className="border-2 border-primary w-full px-6 py-3 rounded-xl"
              {...register('verificationCode', {
                required: "Verification code is required",
                maxLength: { 
                  value: 6, 
                  message: "Verification code must be 6 digits long" 
                }
              })}
              id="verificationCode"
              type="text"
              placeholder="Enter verification code"
            />
            {errors.verificationCode && (
              <span className="text-red-600 text-sm">
                {errors.verificationCode.message}
              </span>
            )}
          </div>
          <button 
            type="button"
            onClick={() => handleVerifyCode(getValues("verificationCode"))}
            className="border-2 border-primary bg-primary text-white px-5 rounded"
          >
            Verify
          </button>
        </div>
      )}

      {/* Name fields */}
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="text-black w-full text-2xl" htmlFor="firstName">
            First Name
          </label>
          <input
            className="border-2 border-primary w-full px-6 py-3 rounded-xl"
            {...register('firstName', {
              required: "First Name is required",
              maxLength: {
                value: 30,
                message: "First Name must be at most 30 characters long"
              }
            })}
            id="firstName"
            type="text"
            placeholder="First Name"
          />
          {errors.firstName && (
            <span className="text-red-600 text-sm">{errors.firstName.message}</span>
          )}
        </div>
        <div className="flex-1">
          <label className="text-black w-full text-2xl" htmlFor="lastName">
            Last Name
          </label>
          <input
            className="border-2 border-primary w-full px-6 py-3 rounded-xl"
            {...register('lastName', {
              required: "Last Name is required",
              maxLength: {
                value: 30,
                message: "Last Name must be at most 30 characters long"
              }
            })}
            id="lastName"
            type="text"
            placeholder="Last Name"
          />
          {errors.lastName && (
            <span className="text-red-600 text-sm">{errors.lastName.message}</span>
          )}
        </div>
      </div>

      {/* Password fields */}
      <div>
        <div className="relative">
          <label className="text-black w-full text-2xl" htmlFor="password">
            Password
          </label>
          <input
            className="border-2 border-primary w-full px-6 py-3 rounded-xl"
            {...register('password', {
              required: "Password is required",
              pattern: {
                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                message: "Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character"
              }
            })}
            id="password"
            type={showPasswords ? "text" : "password"}
            placeholder="Password"
          />
          <button
            type="button"
            onClick={() => setShowPasswords(!showPasswords)}
            className="absolute right-3 bottom-3"
          >
            {showPasswords ? (
              <FaEye className="text-xl" />
            ) : (
              <FaEyeSlash className="text-xl" />
            )}
          </button>
        </div>
        {errors.password && (
          <span className="text-red-600 text-sm">{errors.password.message}</span>
        )}
      </div>

      <div>
        <div className="relative">
          <label className="text-black w-full text-2xl" htmlFor="cpassword">
            Confirm Password
          </label>
          <input
            className="border-2 border-primary w-full px-6 py-3 rounded-xl"
            {...register('cpassword', {
              required: "Confirm Password is required",
              validate: value => value === getValues('password') || "Passwords do not match"
            })}
            id="cpassword"
            type={showPasswords ? "text" : "password"}
            placeholder="Confirm Password"
          />
        </div>
        {errors.cpassword && (
          <span className="text-red-600 text-sm">{errors.cpassword.message}</span>
        )}
      </div>

      {/* Submit button */}
      <button
        className="text-center font-semibold text-white rounded-full 
                 transition-all hover:opacity-75 py-2 bg-primary-dark"
        type="submit"
        disabled={isLoading}
      >
        {isLoading ? (
          <AiOutlineLoading3Quarters className="mx-auto text-2xl animate-spin" />
        ) : (
          "Sign Up"
        )}
      </button>

      {error && <span className="text-red-600 text-sm">{error}</span>}

      {/* Sign in link */}
      <div>
        <Link 
          className="underline text-gray-light text-xs font-semibold text-center block mt-2" 
          to="/sign-in"
        >
          Already have an account? <span className="text-primary-dark">Sign In</span>
        </Link>
      </div>
    </form>
  );

  return (
    <div>

      <MultiStepProgressBar activeTab={activeStep} setActiveTab={setActiveStep}/>

      {activeStep === 0 && (
        <BodyAssessment
          assessmentData={assessmentData}
          onAssessmentChange={setAssessmentData}
          onNext={handleNext}
        />
      )}
      
      {activeStep === 1 && (
        <BodyGoals
          selectedGoal={selectedGoal}
          onGoalSelect={setSelectedGoal}
          onNext={handleNext}
        />
      )}
      
      {activeStep === 2 && renderSignUpForm()}
    </div>
  );
};

export default SignUpForm;