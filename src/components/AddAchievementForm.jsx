// Adds a portfolio achievement and optional local image. Teaches: FileReader + controlled forms.
import { useState } from 'react';
import s from './AddAchievementForm.module.css';

const categories = [
  'Personal',
  'Career',
  'Learning',
  'Health',
  'Creative',
  'Other',
];

export default function AddAchievementForm({ onAdd, onCancel }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().slice(0, 10),
    category: 'Personal',
    image: '',
  });
  const [error, setError] = useState('');
  const change = (event) =>
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  const chooseImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Choose an image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be 5 MB or smaller.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setForm((current) => ({ ...current, image: String(reader.result) }));
      setError('');
    };
    reader.onerror = () => setError('The image could not be read.');
    reader.readAsDataURL(file);
  };
  const submit = (event) => {
    event.preventDefault();
    if (!form.title.trim()) return;
    onAdd({
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
      date: form.date || new Date().toISOString().slice(0, 10),
    });
  };
  return (
    <form className={s.form} onSubmit={submit}>
      <label>
        Title
        <input
          className="input"
          autoFocus
          maxLength="100"
          required
          name="title"
          value={form.title}
          onChange={change}
        />
      </label>
      <label>
        Description
        <textarea
          className="input"
          rows="4"
          maxLength="1000"
          name="description"
          value={form.description}
          onChange={change}
        />
      </label>
      <div className={s.split}>
        <label>
          Date
          <input
            className="input"
            type="date"
            name="date"
            value={form.date}
            onChange={change}
          />
        </label>
        <label>
          Category
          <select
            className="input"
            name="category"
            value={form.category}
            onChange={change}
          >
            {categories.map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>
        </label>
      </div>
      <label>
        Image (optional, max 5 MB)
        <input
          className="input"
          type="file"
          accept="image/*"
          onChange={chooseImage}
        />
      </label>
      {form.image && (
        <img className={s.preview} src={form.image} alt="Achievement preview" />
      )}
      {error && (
        <p className={s.error} role="alert">
          {error}
        </p>
      )}
      <div className={s.actions}>
        <button className="btn" type="submit">
          Save Achievement
        </button>
        <button className={s.cancel} type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
