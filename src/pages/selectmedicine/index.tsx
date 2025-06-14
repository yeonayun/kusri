'use client';

import { useState, useEffect } from 'react';
import styles from './index.module.css';
import HeaderLayout from '@/components/header-layout';
import { useRouter } from 'next/router';

interface Medicine {
  id: number;
  medicine: string;
  user_id: number;
}

const SelectMedicine = () => {
  const router = useRouter();
  const [medicineName, setMedicineName] = useState('');
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [selectedMedicineId, setSelectedMedicineId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchMedicines = async () => {
    try {
      const response = await fetch('/api/medicines/my-take-medicine', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const data = await response.json();
        setMedicines(data.data);
      } else {
        console.error('약 목록 불러오기 실패');
      }
    } catch (error) {
      console.error('에러 발생:', error);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  const handleAddMedicine = async () => {
    const trimmedName = medicineName.trim();
    if (!trimmedName) return;

    const isDuplicate = medicines.some(
      (med) => med.medicine.toLowerCase() === trimmedName.toLowerCase()
    );
    if (isDuplicate) {
      setErrorMessage('이미 등록되어있는 약입니다.');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    try {
      const res = await fetch('/api/medicines/taking-medicine', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ med_name: trimmedName }),
      });

      if (!res.ok) throw new Error('약 추가 실패');

      setMedicineName('');
      fetchMedicines();
    } catch (error) {
      console.error('약 추가 중 에러:', error);
      alert('약 추가에 실패했습니다.');
    }
  };

  const handleNext = () => {
    if (selectedMedicineId === null) return;
    setSubmitting(true);

    const selectedMedicine = medicines.find((m) => m.id === selectedMedicineId);

    if (!selectedMedicine) {
      alert('선택된 약 정보를 찾을 수 없습니다.');
      return;
    }

    router.push({
      pathname: '/addalram',
      query: { medicine: selectedMedicine.medicine },
    });
  };

  const handleSelectMedicine = (id: number) => {
    setSelectedMedicineId(id);
  };

  return (
    <div className={styles.container}>
      <div className={styles.inputSection}>
        <label className={styles.label}>약 추가 </label>

        <div className={styles.inputContainer}>
          <input
            type="text"
            placeholder="약의 이름을 입력해주세요."
            className={styles.input}
            value={medicineName}
            onChange={(e) => setMedicineName(e.target.value)}
          />
          <img
            src="/images/plus.png"
            alt="추가"
            className={styles.plusIcon}
            onClick={handleAddMedicine}
            style={{
              cursor: medicineName.trim() === '' ? 'not-allowed' : 'pointer',
            }}
          />
        </div>

        {errorMessage && (
          <div className={styles.errorMessage}>{errorMessage}</div>
        )}
      </div>

      <div className={styles.tagSection}>
        {medicines.length > 0 ? (
          medicines.map((medicine, index) => (
            <div
              key={medicine.id}
              className={`${styles.filterItem} ${
                selectedMedicineId === medicine.id ? styles.selected : ''
              }`}
              onClick={() => handleSelectMedicine(medicine.id)}
            >
              <span
                className={
                  index % 3 === 0
                    ? styles.dotGreen
                    : index % 3 === 1
                    ? styles.dotBlue
                    : styles.dotYellow
                }
              ></span>
              <span className={styles.medicineName}>{medicine.medicine}</span>
            </div>
          ))
        ) : (
          <div className={styles.loadingTag}>약을 불러오는 중입니다...</div>
        )}
      </div>

      <div className={styles.nextButtonContainer}>
        <button
          className={`${styles.nextButton} ${
            selectedMedicineId !== null ? styles.active : ''
          }`}
          onClick={handleNext}
          disabled={selectedMedicineId === null || submitting}
        >
          다음
        </button>
      </div>
    </div>
  );
};

export default function Page() {
  return (
    <>
      <HeaderLayout>알람추가</HeaderLayout>
      <SelectMedicine />
    </>
  );
}
