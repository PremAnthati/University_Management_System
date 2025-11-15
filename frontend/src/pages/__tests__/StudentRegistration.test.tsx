import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import StudentRegistration from '../StudentRegistration';
import { studentAPI } from '../../services/api';

// Mock the API
jest.mock('../../services/api');
const mockStudentAPI = studentAPI as jest.Mocked<typeof studentAPI>;

describe('StudentRegistration Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders registration form with step 1', () => {
    render(<StudentRegistration />);

    expect(screen.getByText('Student Registration')).toBeInTheDocument();
    expect(screen.getByText('Personal Information')).toBeInTheDocument();
    expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Phone Number')).toBeInTheDocument();
  });

  test('validates step 1 fields', async () => {
    render(<StudentRegistration />);

    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText('Full name is required')).toBeInTheDocument();
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Phone number is required')).toBeInTheDocument();
    });
  });

  test('moves to step 2 when step 1 is valid', async () => {
    render(<StudentRegistration />);

    // Fill step 1
    fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText('Phone Number'), { target: { value: '1234567890' } });
    fireEvent.change(screen.getByLabelText('Date of Birth'), { target: { value: '2000-01-01' } });
    fireEvent.change(screen.getByLabelText('Gender'), { target: { value: 'Male' } });
    fireEvent.change(screen.getByLabelText('Address'), { target: { value: '123 Main St' } });
    fireEvent.change(screen.getByLabelText('City'), { target: { value: 'Anytown' } });
    fireEvent.change(screen.getByLabelText('State'), { target: { value: 'State' } });
    fireEvent.change(screen.getByLabelText('Pincode'), { target: { value: '12345' } });

    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText('Academic Information')).toBeInTheDocument();
    });
  });

  test('validates step 2 fields', async () => {
    render(<StudentRegistration />);

    // Fill step 1 and move to step 2
    fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText('Phone Number'), { target: { value: '1234567890' } });
    fireEvent.change(screen.getByLabelText('Date of Birth'), { target: { value: '2000-01-01' } });
    fireEvent.change(screen.getByLabelText('Gender'), { target: { value: 'Male' } });
    fireEvent.change(screen.getByLabelText('Address'), { target: { value: '123 Main St' } });
    fireEvent.change(screen.getByLabelText('City'), { target: { value: 'Anytown' } });
    fireEvent.change(screen.getByLabelText('State'), { target: { value: 'State' } });
    fireEvent.change(screen.getByLabelText('Pincode'), { target: { value: '12345' } });

    fireEvent.click(screen.getByText('Next'));

    // Now in step 2, click Next without filling
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText('Department is required')).toBeInTheDocument();
      expect(screen.getByText('Course is required')).toBeInTheDocument();
    });
  });

  test('validates step 3 fields', async () => {
    render(<StudentRegistration />);

    // Fill steps 1 and 2
    fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText('Phone Number'), { target: { value: '1234567890' } });
    fireEvent.change(screen.getByLabelText('Date of Birth'), { target: { value: '2000-01-01' } });
    fireEvent.change(screen.getByLabelText('Gender'), { target: { value: 'Male' } });
    fireEvent.change(screen.getByLabelText('Address'), { target: { value: '123 Main St' } });
    fireEvent.change(screen.getByLabelText('City'), { target: { value: 'Anytown' } });
    fireEvent.change(screen.getByLabelText('State'), { target: { value: 'State' } });
    fireEvent.change(screen.getByLabelText('Pincode'), { target: { value: '12345' } });

    fireEvent.click(screen.getByText('Next'));

    fireEvent.change(screen.getByLabelText('Department'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Course/Program'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Year'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Semester'), { target: { value: '1' } });

    fireEvent.click(screen.getByText('Next'));

    // Now in step 3, click Register without filling
    const registerButton = screen.getByText('Register');
    fireEvent.click(registerButton);

    await waitFor(() => {
      expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
      expect(screen.getByText('Please accept terms and conditions')).toBeInTheDocument();
    });
  });

  test('submits registration successfully', async () => {
    const mockResponse = {
      data: {
        message: 'Registration successful. Please wait for admin approval.',
        registration_id: 'REG123456789',
        student: { id: '123' }
      }
    };

    mockStudentAPI.register.mockResolvedValue(mockResponse);

    // Mock alert
    const mockAlert = jest.spyOn(window, 'alert').mockImplementation(() => {});

    render(<StudentRegistration />);

    // Fill all steps
    fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText('Phone Number'), { target: { value: '1234567890' } });
    fireEvent.change(screen.getByLabelText('Date of Birth'), { target: { value: '2000-01-01' } });
    fireEvent.change(screen.getByLabelText('Gender'), { target: { value: 'Male' } });
    fireEvent.change(screen.getByLabelText('Address'), { target: { value: '123 Main St' } });
    fireEvent.change(screen.getByLabelText('City'), { target: { value: 'Anytown' } });
    fireEvent.change(screen.getByLabelText('State'), { target: { value: 'State' } });
    fireEvent.change(screen.getByLabelText('Pincode'), { target: { value: '12345' } });

    fireEvent.click(screen.getByText('Next'));

    fireEvent.change(screen.getByLabelText('Department'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Course/Program'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Year'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Semester'), { target: { value: '1' } });

    fireEvent.click(screen.getByText('Next'));

    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByLabelText('I accept the Terms & Conditions'));

    fireEvent.click(screen.getByText('Register'));

    await waitFor(() => {
      expect(mockStudentAPI.register).toHaveBeenCalledWith({
        full_name: 'John Doe',
        email: 'john@example.com',
        phone_number: '1234567890',
        date_of_birth: '2000-01-01',
        gender: 'Male',
        address: '123 Main St',
        city: 'Anytown',
        state: 'State',
        pincode: '12345',
        department_id: '1',
        course_id: '1',
        year: '1',
        semester: '1',
        password: 'password123',
        termsAccepted: true
      });
      expect(mockAlert).toHaveBeenCalledWith('Registration successful! Your registration ID is: REG123456789');
    });

    mockAlert.mockRestore();
  });

  test('handles registration error', async () => {
    const mockError = {
      response: {
        data: { message: 'Email already exists' }
      }
    };

    mockStudentAPI.register.mockRejectedValue(mockError);

    const mockAlert = jest.spyOn(window, 'alert').mockImplementation(() => {});

    render(<StudentRegistration />);

    // Fill all required fields quickly
    fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText('Phone Number'), { target: { value: '1234567890' } });
    fireEvent.change(screen.getByLabelText('Date of Birth'), { target: { value: '2000-01-01' } });
    fireEvent.change(screen.getByLabelText('Gender'), { target: { value: 'Male' } });
    fireEvent.change(screen.getByLabelText('Address'), { target: { value: '123 Main St' } });
    fireEvent.change(screen.getByLabelText('City'), { target: { value: 'Anytown' } });
    fireEvent.change(screen.getByLabelText('State'), { target: { value: 'State' } });
    fireEvent.change(screen.getByLabelText('Pincode'), { target: { value: '12345' } });

    fireEvent.click(screen.getByText('Next'));

    fireEvent.change(screen.getByLabelText('Department'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Course/Program'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Year'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Semester'), { target: { value: '1' } });

    fireEvent.click(screen.getByText('Next'));

    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByLabelText('I accept the Terms & Conditions'));

    fireEvent.click(screen.getByText('Register'));

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith('Email already exists');
    });

    mockAlert.mockRestore();
  });
});