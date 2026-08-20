import { useState } from 'react';
import styles from './WeightForm.module.css';
import { todayISO } from '../../utils/dateUtils/dateUtils';

export default function WeightForm({ onSave, defaultUnit = 'lb', onCancel }) {
    const [date, setDate] = useState(todayISO());
    const [weight, setWeight] = useState('');
    const [unit, setUnit] = useState(defaultUnit);
    const [note, setNote] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const parsed = parseFloat(weight);
        if (!parsed || parsed <= 0) {
            setError('Enter a valid weight.');
            return;
        }
        setError(null);
        setSaving(true);
        try {
            await onSave({ date, weight: parsed, unit, note: note.trim() || null });
            setWeight('');
            setNote('');
        } catch (err) {
            setError('Could not save — try again.');
        }
        setSaving(false);
    };

    return (
        <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.row}>
                <label className={styles.field}>
                    <span>Date</span>
                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)} max={todayISO()} />
                </label>
                <label className={styles.field}>
                    <span>Weight</span>
                    <div className={styles.weightInputGroup}>
                        <input
                            type="number"
                            inputMode="decimal"
                            step="0.1"
                            min="0"
                            placeholder="0.0"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            autoFocus
                        />
                        <div className={styles.unitToggle}>
                            {['lb', 'kg'].map((u) => (
                                <button
                                    type="button"
                                    key={u}
                                    className={unit === u ? styles.unitActive : styles.unitButton}
                                    onClick={() => setUnit(u)}
                                >
                                    {u}
                                </button>
                            ))}
                        </div>
                    </div>
                </label>
            </div>
            <label className={styles.field}>
                <span>Note (optional)</span>
                <input
                    type="text"
                    placeholder="e.g. after workout"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                />
            </label>

            {error && <p className={styles.error}>{error}</p>}

            <div className={styles.actions}>
                {onCancel && (
                    <button type="button" className={styles.cancelButton} onClick={onCancel}>
                        Cancel
                    </button>
                )}
                <button type="submit" className={styles.saveButton} disabled={saving}>
                    {saving ? 'Saving…' : 'Log weight'}
                </button>
            </div>
        </form>
    );
}
