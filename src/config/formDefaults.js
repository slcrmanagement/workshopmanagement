/**
 * Default registration fields and feedback questions.
 * Each workshop in workshops.js can override these with its own
 * `registrationFields` / `feedbackQuestions` arrays to run a different
 * form — these are only the fallback used if a workshop doesn't set its own.
 *
 * Field/question shape: { key, label, type, required, options? }
 *   type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'radio'
 *   options: required for 'select' and 'radio'
 *
 * `key` becomes the property name stored in the source JSON row, so keep
 * it stable once a workshop has real submissions.
 */

export const DEFAULT_REGISTRATION_FIELDS = [
  { key: 'name', label: 'Name of Candidate', type: 'text', required: true },
  { key: 'gender', label: 'Gender', type: 'select', required: true, options: ['Male', 'Female', 'Other'] },
  { key: 'email', label: 'Email Address', type: 'email', required: true },
  { key: 'designation', label: 'Designation', type: 'text', required: true },
  { key: 'primaryAreaOfWork', label: 'Primary Area of Work', type: 'text', required: false },
  { key: 'organization', label: 'Organization / Institute', type: 'text', required: true },
  { key: 'address', label: 'Address', type: 'textarea', required: true },
  { key: 'phone', label: 'Phone / Mobile No.', type: 'tel', required: true },
  { key: 'accommodationRequired', label: 'Accommodation Required?', type: 'radio', required: true, options: ['Yes', 'No'] },
];

export const DEFAULT_FEEDBACK_QUESTIONS = [
  {
    key: 'expectations',
    label: 'To what extent did the workshop meet your expectations?',
    type: 'radio',
    required: true,
    options: ['Exceeded Expectations', 'Met Expectations', 'Partially Met Expectations', 'Did Not Meet Expectations'],
  },
  {
    key: 'overallQuality',
    label: 'How would you rate the overall quality of the workshop?',
    type: 'radio',
    required: true,
    options: ['Excellent', 'Good', 'Satisfactory', 'Needs Improvement'],
  },
  {
    key: 'contentRelevance',
    label: 'How relevant was the workshop content to your professional or academic needs?',
    type: 'radio',
    required: true,
    options: ['Highly Relevant', 'Relevant', 'Somewhat Relevant', 'Not Relevant'],
  },
  {
    key: 'resourcePerson',
    label: 'How would you rate the knowledge and delivery of the resource person(s)?',
    type: 'radio',
    required: true,
    options: ['Excellent', 'Good', 'Satisfactory', 'Needs Improvement'],
  },
  {
    key: 'sessionEffectiveness',
    label: 'How effective were the presentations, discussions, and practical sessions?',
    type: 'radio',
    required: true,
    options: ['Highly Effective', 'Effective', 'Moderately Effective', 'Not Effective'],
  },
  {
    key: 'arrangements',
    label: 'How would you rate the workshop arrangements, including venue, time management, and coordination?',
    type: 'radio',
    required: true,
    options: ['Excellent', 'Good', 'Satisfactory', 'Needs Improvement'],
  },
  {
    key: 'mostUsefulAspect',
    label: 'What was the most useful aspect of the workshop?',
    type: 'textarea',
    required: false,
  },
  {
    key: 'suggestions',
    label: 'Suggestions for improving future workshops',
    type: 'textarea',
    required: false,
  },
];
