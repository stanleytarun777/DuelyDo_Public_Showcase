/**
 * TaskHelpers.js — Shared utilities and constants
 *
 * Full implementations maintained in the private repository.
 */

/** Base URL for the Python backend API. Configurable via VITE_API_BASE_URL. */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/** LocalStorage keys for client-side persistence. */
export const TASKS_KEY = 'duelydo.tasks.v1';
export const FOLDERS_KEY = 'duelydo.folders.v1';

/** Default shape for a new manually entered task. */
export const emptyManualTask = {
  title: '',
  subject: '',
  dueDate: '',
  priority: 'medium',
  type: 'assignment',
  description: ''
};

/**
 * Normalizes a raw task object into a consistent shape.
 * Fills missing fields with defaults and resolves overdue status.
 *
 * @param {object} task - Raw task data from API or localStorage
 * @param {number} index - Used to generate a unique fallback ID
 * @returns {object} Normalized task
 */
export function normalizeTask(_task, _index = 0) { /* private */ }

/**
 * Normalizes a raw folder object. Returns null for invalid (empty course) entries.
 *
 * @param {object} folder - Raw folder data
 * @param {number} index - Used to generate a unique fallback ID
 * @returns {object|null} Normalized folder or null
 */
export function normalizeFolder(_folder, _index = 0) { /* private */ }

/**
 * Returns true if a task's due date has passed end-of-day.
 *
 * @param {string} dateString - ISO date string (YYYY-MM-DD)
 * @returns {boolean}
 */
export function isOverdue(_dateString) { /* private */ }

/**
 * Converts an ISO date string into a human-readable label.
 * Examples: "Due today", "Due in 3d", "2d overdue", "Apr 20, 2025"
 *
 * @param {string} dateString - ISO date string (YYYY-MM-DD)
 * @returns {string}
 */
export function dueDisplay(_dateString) { /* private */ }
