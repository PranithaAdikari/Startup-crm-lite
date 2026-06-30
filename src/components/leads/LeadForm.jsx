import { useState } from 'react';
import { LEAD_STATUSES, LEAD_SOURCES } from '../../constants';

/**
 * @typedef {Object} LeadData
 * @property {string} name - Contact name.
 * @property {string} company - Company name.
 * @property {string} email - Contact email address.
 * @property {string} [phone] - Phone number.
 * @property {string} status - Pipeline status.
 * @property {string} source - Lead acquisition channel.
 * @property {string|number} [value] - Estimated budget or deal value.
 */

/**
 * @typedef {Object} LeadFormProps
 * @property {LeadData} [initialData] - Existing lead data for edit mode.
 * @property {(data: LeadData) => void} onSubmit - Callback invoked on successful form submission.
 * @property {() => void} onCancel - Callback to close form or modal.
 */

/**
 * LeadForm Component
 * Renders an accessible form for creating and updating CRM leads.
 *
 * @param {LeadFormProps} props - Component props.
 * @returns {React.ReactElement} The rendered LeadForm component.
 */
export default function LeadForm({ initialData, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    status: 'New',
    source: 'Website',
    value: '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [prevInitialData, setPrevInitialData] = useState(initialData);

  if (initialData !== prevInitialData) {
    setFormData({
      name: initialData?.name || '',
      company: initialData?.company || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      status: initialData?.status || 'New',
      source: initialData?.source || 'Website',
      value: initialData?.value ? String(initialData?.value).replace(/[^0-9.-]+/g, '') : '',
    });
    setPrevInitialData(initialData);
  }



  /**
   * Validates form fields and updates the errors state.
   *
   * @returns {boolean} True if the form is valid, false otherwise.
   */
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.company.trim()) {
      newErrors.company = 'Company is required';
    }

    const emailTrimmed = formData.email.trim();
    if (!emailTrimmed) {
      newErrors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailTrimmed)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    if (formData.value && isNaN(parseFloat(formData.value))) {
      newErrors.value = 'Value must be a numeric budget amount';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear validation error when field is updated
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateForm();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Set all fields to touched
    const allTouched = {};
    Object.keys(formData).forEach((key) => {
      allTouched[key] = true;
    });
    setTouched(allTouched);

    if (validateForm()) {
      // Format value back as raw USD for storage (e.g. 8500 -> $8,500)
      const numericVal = parseFloat(formData.value);
      const formattedValue = isNaN(numericVal) 
        ? '$0' 
        : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(numericVal);

      onSubmit({
        ...formData,
        value: formattedValue,
      });
    }
  };

  const isEditMode = !!initialData;

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div className="space-y-4">
        {/* Row 1: Name and Company */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-xs font-semibold text-text-main uppercase tracking-wider mb-1.5">
              Contact Name <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g. John Doe"
              className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-bg-canvas/50 text-text-main placeholder-text-sub/50 focus:outline-none focus:ring-1 transition-all duration-200 ${
                errors.name && touched.name
                  ? 'border-danger/60 focus:border-danger focus:ring-danger'
                  : 'border-border-accent focus:border-primary focus:ring-primary'
              }`}
              required
            />
            {errors.name && touched.name && (
              <p className="text-xs text-danger mt-1 font-semibold">{errors.name}</p>
            )}
          </div>

          <div>
            <label htmlFor="company" className="block text-xs font-semibold text-text-main uppercase tracking-wider mb-1.5">
              Company <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              id="company"
              name="company"
              value={formData.company}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g. Acme Corp"
              className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-bg-canvas/50 text-text-main placeholder-text-sub/50 focus:outline-none focus:ring-1 transition-all duration-200 ${
                errors.company && touched.company
                  ? 'border-danger/60 focus:border-danger focus:ring-danger'
                  : 'border-border-accent focus:border-primary focus:ring-primary'
              }`}
              required
            />
            {errors.company && touched.company && (
              <p className="text-xs text-danger mt-1 font-semibold">{errors.company}</p>
            )}
          </div>
        </div>

        {/* Row 2: Email and Phone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-text-main uppercase tracking-wider mb-1.5">
              Email Address <span className="text-danger">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="john@example.com"
              className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-bg-canvas/50 text-text-main placeholder-text-sub/50 focus:outline-none focus:ring-1 transition-all duration-200 ${
                errors.email && touched.email
                  ? 'border-danger/60 focus:border-danger focus:ring-danger'
                  : 'border-border-accent focus:border-primary focus:ring-primary'
              }`}
              required
            />
            {errors.email && touched.email && (
              <p className="text-xs text-danger mt-1 font-semibold">{errors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="phone" className="block text-xs font-semibold text-text-main uppercase tracking-wider mb-1.5">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1 (555) 000-0000"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border-accent bg-bg-canvas/50 text-text-main placeholder-text-sub/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
            />
          </div>
        </div>

        {/* Row 3: Status and Source */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="status" className="block text-xs font-semibold text-text-main uppercase tracking-wider mb-1.5">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border-accent bg-bg-canvas text-text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200 cursor-pointer"
            >
              {LEAD_STATUSES.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="source" className="block text-xs font-semibold text-text-main uppercase tracking-wider mb-1.5">
              Source
            </label>
            <select
              id="source"
              name="source"
              value={formData.source}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border-accent bg-bg-canvas text-text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200 cursor-pointer"
            >
              {LEAD_SOURCES.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 4: Deal Value (Optional, for pipeline graphics) */}
        <div>
          <label htmlFor="value" className="block text-xs font-semibold text-text-main uppercase tracking-wider mb-1.5">
            Deal Value (USD)
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-text-sub font-semibold">
              $
            </span>
            <input
              type="text"
              id="value"
              name="value"
              value={formData.value}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g. 5000"
              className={`w-full pl-7 pr-3.5 py-2.5 text-sm rounded-xl border bg-bg-canvas/50 text-text-main placeholder-text-sub/50 focus:outline-none focus:ring-1 transition-all duration-200 ${
                errors.value && touched.value
                  ? 'border-danger/60 focus:border-danger focus:ring-danger'
                  : 'border-border-accent focus:border-primary focus:ring-primary'
              }`}
            />
          </div>
          {errors.value && touched.value && (
            <p className="text-xs text-danger mt-1 font-semibold">{errors.value}</p>
          )}
          <p className="text-[10px] text-text-sub mt-1">
            Optional budget estimation used in visual sales pipeline analytics.
          </p>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-3 justify-end pt-4 border-t border-border-accent/40">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2.5 text-sm font-semibold border border-border-accent bg-bg-card hover:bg-bg-canvas text-text-main rounded-xl transition-all duration-200 cursor-pointer hover:shadow-sm"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-5 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary/95 rounded-xl shadow-sm hover:shadow transition-all duration-200 cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
        >
          {isEditMode ? 'Save Changes' : 'Create Lead'}
        </button>
      </div>
    </form>
  );
}
