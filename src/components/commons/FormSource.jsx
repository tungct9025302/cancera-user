import React, { Component } from "react";

let x = new Date().toISOString().slice(0, 10);
export const loginInputs = [
  {
    id: "username",
    label: "Username",
    type: "text",
    placeholder: "Input your username.",
    noInputMessage: "Username is required.",
    failedLoginMessage: "Wrong username or password.",
    wrongTypeInputMessage: "Username must be an email type.",
    placeholderForCreate: "Username must be an email.",
  },
  {
    id: "password",
    label: "Password",
    type: "password",
    placeholder: "Input your password.",
    noInputMessage: "Password is required.",
    failedLoginMessage: "Wrong username or password.",
    wrongTypeInputMessage: "Your password length is below 6.",
    placeholderForCreate: "Password must have length above 6.",
  },
];

export const createInputs = [
  {
    id: "username",
    label: "Username",
    type: "text",
    placeholder: "Input your username.",
    noInputMessage: "Username is required.",
    failedLoginMessage: "This email is existed. Try other username...",
    wrongTypeInputMessage: "Username must be an email type.",
    placeholderForCreate: "Example: username@yahoo.com",
  },
  {
    id: "password",
    label: "Password",
    type: "password",
    placeholder: "Input your password.",
    noInputMessage: "Password is required.",
    failedLoginMessage: "",
    wrongTypeInputMessage: "Your password length must be above 6.",
    placeholderForCreate: "Example: 123456",
  },
];

export const changePasswordInputs = [
  {
    id: "old password",
    label: "Old password",
    type: "password",
    placeholder: "Input your old password.",
    failedLoginMessage: "Old password is incorrect.",
    wrongTypeInputMessage: "Your password length must be above 6.",
    sameInputMessage: "",
  },
  {
    id: "new password",
    label: "New password",
    type: "password",
    placeholder: "Input your new password.",
    failedLoginMessage: "",
    wrongTypeInputMessage: "Your password length must be above 6.",
    sameInputMessage: "Your new password must be different from old password.",
  },
  {
    id: "confirm new password",
    label: "Confirm new password",
    type: "password",
    placeholder: "Confirm your new password by typing again.",
    failedLoginMessage: "",
    wrongTypeInputMessage: "Confirm password must match the new password.",
    sameInputMessage: "",
  },
];

export const viewProfileInputsForUsers = [
  {
    id: "username",
    label: "username",
    type: "text",
  },
  {
    id: "name",
    label: "name",
    type: "text",
  },
  {
    id: "date of birth",
    label: "date of birth",
    type: "text",
  },
  {
    id: "gender",
    label: "gender",
    type: "text",
  },
  {
    id: "phone number",
    label: "phone number",
    type: "text",
  },
  {
    id: "career",
    label: "career",
    type: "text",
  },
  {
    id: "department",
    label: "department",
    type: "text",
  },
  {
    id: "last login",
    label: "last login",
    type: "text",
  },
];

export const viewProfileInputsForPatients = [
  {
    id: "username",
    label: "username",
    type: "text",
  },
  {
    id: "name",
    label: "name",
    type: "text",
  },
  {
    id: "date of birth",
    label: "date of birth",
    type: "text",
  },
  {
    id: "gender",
    label: "gender",
    type: "text",
  },
  {
    id: "phone number",
    label: "phone number",
    type: "text",
  },
  {
    id: "career",
    label: "career",
    type: "text",
  },
  {
    id: "cancer",
    label: "cancer",
    type: "text",
  },
  {
    id: "last login",
    label: "last login",
    type: "text",
  },
];

export const addPatientInputs = [
  {
    id: "name",
    label: "Patient name",
    formType: "input",
    type: "text",
    noInputMessage: "Patient name is required.",
    placeholder: "",
    inWrongTimeMessage: "",
  },
  {
    id: "date of birth",
    label: "Date of birth",
    formType: "input",
    type: "date",
    placeholder: "",
    noInputMessage: "Date of birth is required.",
    inWrongTimeMessage: "Unable to set this date as date of birth",
  },
  {
    id: "gender",
    label: "Gender",
    formType: "select",
    type: "",
    placeholder: "",
    noInputMessage: "Gender is required.",
    inWrongTimeMessage: "",
  },
  {
    id: "career",
    label: "Career",
    formType: "input",
    type: "text",
    placeholder: "",
    noInputMessage: "Career is required.",
    inWrongTimeMessage: "",
  },
  {
    id: "cancer",
    label: "Cancer type",
    formType: "input",
    type: "text",
    placeholder: "",
    noInputMessage: "Cancer type is required.",
    inWrongTimeMessage: "",
  },
  {
    id: "phone number",
    label: "Phone number",
    formType: "input",
    type: "tel",
    placeholder: "",
    noInputMessage: "Phone number is required in 10 numbers.",
    inWrongTimeMessage: "",
  },
  {
    id: "habits",
    label: "Habits",
    formType: "input",
    type: "text",
    noInputMessage: "",
    placeholder: "Example: Sit too long, living in polluted area.",
    inWrongTimeMessage: "",
  },
  {
    id: "chronic illness",
    label: "Chronic Illness(es)",
    formType: "input",
    type: "text",
    noInputMessage: "",
    placeholder: "Example: Cardiovascular from parents",
    inWrongTimeMessage: "",
  },
  {
    id: "history of treatment",
    label: "History of treatment(s)",
    formType: "input",
    type: "text",
    noInputMessage: "",
    placeholder: "Example: Cryoabilation",
    inWrongTimeMessage: "",
  },
  {
    id: "last general examination date",
    label: "Last general examination date",
    formType: "input",
    type: "date",
    noInputMessage: "",
    placeholder: "Example: 12-31-2021",
    inWrongTimeMessage: `Last general examination date must be today or before ${x}`,
  },
  {
    id: "next appointment",
    label: "Next appointment date",
    formType: "input",
    type: "date",
    noInputMessage: "",
    placeholder: "Example: Heart rate:98...",
    inWrongTimeMessage: `Next appointment must be after ${x}.`,
  },
];

export const appointmentInputs = [
  {
    id: "name",
    label: "Patient name",
    formType: "input",
    type: "text",
    noInputMessage: "",
    placeholder: "",
    inWrongTimeMessage: "",
  },
  {
    id: "doctor name",
    label: "Doctor name",
    formType: "input",
    type: "text",
    noInputMessage: "",
    placeholder: "",
    inWrongTimeMessage: "",
  },
  {
    id: "doctor id",
    label: "Doctor ID",
    formType: "input",
    type: "number",
    noInputMessage: "",
    placeholder: "",
    inWrongTimeMessage: "",
  },
  {
    id: "title",
    label: "Title",
    formType: "input",
    type: "text",
    noInputMessage: "Title is required.",
    placeholder: "Example: Initialize Cryoabilation.",
    inWrongTimeMessage: "",
  },
  {
    id: "date",
    label: "Date",
    formType: "input",
    type: "date",
    noInputMessage: "Date is required.",
    placeholder: "Example: Heart rate:98...",
    inWrongTimeMessage: "Unable to set appointment on this date.",
  },
  {
    id: "floor",
    label: "Floor",
    formType: "select",
    type: "",
    noInputMessage: "Floor is required.",
    placeholder: "",
    inWrongTimeMessage: "",
  },
  {
    id: "room",
    label: "Room",
    formType: "select",
    type: "",
    noInputMessage: "Room is required",
    placeholder: "",
    inWrongTimeMessage: "",
  },
  {
    id: "time",
    label: "Time",
    formType: "input",
    type: "time",
    noInputMessage: "Time is required",
    placeholder: "",
    inWrongTimeMessage: "Time is not in work time.",
  },
  {
    id: "cancer",
    label: "Cancer",
    formType: "input",
    type: "text",
    noInputMessage: "Cancer type is required",
    placeholder: "",
    inWrongTimeMessage: "",
  },
];

export const generalExaminationInputs = [
  {
    id: "name",
    label: "Patient name",
    formType: "input",
    type: "text",
    noInputMessage: "",
    placeholder: "",
    rightAddon: "",
    inWrongTimeMessage: "",
  },
  {
    id: "creator name",
    label: "Creator name",
    formType: "input",
    type: "text",
    noInputMessage: "",
    placeholder: "",
    inWrongTimeMessage: "",
  },
  {
    id: "creator id",
    label: "Creator ID",
    formType: "input",
    type: "number",
    noInputMessage: "",
    placeholder: "",
    inWrongTimeMessage: "",
  },
  {
    id: "date",
    label: "Date",
    formType: "input",
    type: "date",
    rightAddon: "",
    noInputMessage: "Date is required",
    placeholder: "",
    inWrongTimeMessage: "General examination record date is in the future.",
  },
  {
    id: "blood pressure",
    label: "Blood pressure",
    formType: "input",
    type: "text",
    rightAddon: "mmHg",
    noInputMessage: "Blood pressure is required.",
    placeholder: "Example: 100/80mmHg",
    inWrongTimeMessage: "",
  },
  {
    id: "blood concentration",
    label: "Blood concentration",
    formType: "input",
    type: "number",
    rightAddon: "g/dL",
    noInputMessage: "Blood concentration is required.",
    placeholder: "Example:20g/dL",
    inWrongTimeMessage: "",
  },
  {
    id: "blood glucose",
    label: "Blood glucose",
    formType: "input",
    type: "number",
    rightAddon: "mg/dL",
    noInputMessage: "Blood glucose is required.",
    placeholder: "Example:120mg/dL",
    inWrongTimeMessage: "",
  },
  {
    id: "heart rate",
    label: "Heart rate",
    formType: "input",
    type: "number",
    rightAddon: "bpm",
    noInputMessage: "Heart rate is required.",
    placeholder: "Example:100bpm.",
    inWrongTimeMessage: "",
  },
];

export const treatmentInputs = [
  {
    id: "name",
    label: "Patient name",
    formType: "input",
    type: "text",
    noInputMessage: "",
    placeholder: "",
    inWrongTimeMessage: "",
  },
  {
    id: "creator name",
    label: "Creator name",
    formType: "input",
    type: "text",
    noInputMessage: "",
    placeholder: "",
    inWrongTimeMessage: "",
  },
  {
    id: "creator id",
    label: "Creator ID",
    formType: "input",
    type: "number",
    noInputMessage: "",
    placeholder: "",
    inWrongTimeMessage: "",
  },
  {
    id: "date",
    label: "Date",
    formType: "input",
    type: "date",
    noInputMessage: "Date is required",
    placeholder: "",
    inWrongTimeMessage: `Treatment record date must be on ${x} or before.`,
  },
  {
    id: "treatment type",
    label: "Treatment type",
    formType: "select",
    type: "",
    noInputMessage: "Treatment type is required",
    placeholder: "",
    inWrongTimeMessage: "",
  },
  {
    id: "duration",
    label: "Duration",
    formType: "input",
    type: "number",
    noInputMessage: "Duration is required",
    placeholder: "",
    inWrongTimeMessage: "",
  },
];
