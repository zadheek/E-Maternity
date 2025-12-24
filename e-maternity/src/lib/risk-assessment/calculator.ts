import { RiskLevel } from '@/types';
import type { RiskAssessmentFactors } from '@/types';

/**
 * Calculate risk level based on multiple maternal health factors
 * Returns: LOW, MODERATE, HIGH, or CRITICAL
 */
export function calculateRiskLevel(factors: RiskAssessmentFactors): RiskLevel {
  let riskScore = 0;

  // Age factors (High risk: <18 or >35)
  if (factors.age < 18) {
    riskScore += 3; // Very young mothers
  } else if (factors.age < 20) {
    riskScore += 2; // Young mothers
  } else if (factors.age > 35 && factors.age <= 40) {
    riskScore += 2; // Advanced maternal age
  } else if (factors.age > 40) {
    riskScore += 4; // Very advanced maternal age
  }

  // Weight/BMI factors
  if (factors.isUnderweight) {
    riskScore += 3; // Underweight is a significant risk
  }

  // Previous pregnancy complications
  if (factors.hadAbnormalBabies) {
    riskScore += 4; // History of abnormal babies/congenital issues
  }

  if (factors.previousMiscarriages >= 3) {
    riskScore += 4; // Multiple miscarriages
  } else if (factors.previousMiscarriages >= 2) {
    riskScore += 3;
  } else if (factors.previousMiscarriages === 1) {
    riskScore += 1;
  }

  if (factors.previousCesareans >= 3) {
    riskScore += 3; // Multiple cesareans
  } else if (factors.previousCesareans >= 2) {
    riskScore += 2;
  } else if (factors.previousCesareans === 1) {
    riskScore += 1;
  }

  // Chronic conditions
  if (factors.hasChronicConditions) {
    riskScore += 3; // Pre-existing medical conditions
  }

  // Blood pressure (if available)
  if (factors.bloodPressure) {
    const { systolic, diastolic } = factors.bloodPressure;
    if (systolic >= 160 || diastolic >= 110) {
      riskScore += 5; // Severe hypertension
    } else if (systolic >= 140 || diastolic >= 90) {
      riskScore += 3; // Hypertension
    } else if (systolic >= 130 || diastolic >= 85) {
      riskScore += 1; // Prehypertension
    }
  }

  // Hemoglobin (if available) - Anemia check
  if (factors.hemoglobin !== undefined) {
    if (factors.hemoglobin < 7) {
      riskScore += 5; // Severe anemia
    } else if (factors.hemoglobin < 9) {
      riskScore += 3; // Moderate anemia
    } else if (factors.hemoglobin < 11) {
      riskScore += 2; // Mild anemia
    }
  }

  // Blood glucose (if available) - Gestational diabetes check
  if (factors.bloodGlucose !== undefined) {
    if (factors.bloodGlucose >= 200) {
      riskScore += 5; // Very high glucose
    } else if (factors.bloodGlucose >= 140) {
      riskScore += 3; // High glucose
    } else if (factors.bloodGlucose >= 100) {
      riskScore += 1; // Elevated glucose
    }
  }

  // Determine risk level based on score
  if (riskScore >= 15) {
    return RiskLevel.CRITICAL;
  } else if (riskScore >= 10) {
    return RiskLevel.HIGH;
  } else if (riskScore >= 5) {
    return RiskLevel.MODERATE;
  } else {
    return RiskLevel.LOW;
  }
}

/**
 * Calculate BMI from weight and height
 * @param weight - Weight in kg
 * @param height - Height in cm
 * @returns BMI value
 */
export function calculateBMI(weight: number, height: number): number {
  const heightInMeters = height / 100;
  return weight / (heightInMeters * heightInMeters);
}

/**
 * Determine if a person is underweight based on BMI
 * @param bmi - BMI value
 * @returns true if underweight (BMI < 18.5)
 */
export function isUnderweight(bmi: number): boolean {
  return bmi < 18.5;
}

/**
 * Get BMI category
 */
export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

/**
 * Calculate recommended weight gain during pregnancy based on pre-pregnancy BMI
 * @param prePregnancyBMI - BMI before pregnancy
 * @returns Object with min and max recommended weight gain in kg
 */
export function getRecommendedWeightGain(prePregnancyBMI: number): {
  min: number;
  max: number;
  category: string;
} {
  if (prePregnancyBMI < 18.5) {
    return { min: 12.5, max: 18, category: 'Underweight' };
  } else if (prePregnancyBMI < 25) {
    return { min: 11.5, max: 16, category: 'Normal' };
  } else if (prePregnancyBMI < 30) {
    return { min: 7, max: 11.5, category: 'Overweight' };
  } else {
    return { min: 5, max: 9, category: 'Obese' };
  }
}

/**
 * Get risk factors as human-readable list
 */
export function getRiskFactorsList(factors: RiskAssessmentFactors): string[] {
  const riskFactors: string[] = [];

  if (factors.age < 18) {
    riskFactors.push('Very young maternal age (under 18)');
  } else if (factors.age > 35) {
    riskFactors.push(`Advanced maternal age (${factors.age} years)`);
  }

  if (factors.isUnderweight) {
    riskFactors.push('Underweight/Low BMI');
  }

  if (factors.hadAbnormalBabies) {
    riskFactors.push('History of abnormal pregnancies');
  }

  if (factors.previousMiscarriages > 0) {
    riskFactors.push(`Previous miscarriages (${factors.previousMiscarriages})`);
  }

  if (factors.previousCesareans > 0) {
    riskFactors.push(`Previous cesarean sections (${factors.previousCesareans})`);
  }

  if (factors.hasChronicConditions) {
    riskFactors.push('Pre-existing chronic conditions');
  }

  if (factors.bloodPressure) {
    const { systolic, diastolic } = factors.bloodPressure;
    if (systolic >= 140 || diastolic >= 90) {
      riskFactors.push(`High blood pressure (${systolic}/${diastolic} mmHg)`);
    }
  }

  if (factors.hemoglobin !== undefined && factors.hemoglobin < 11) {
    riskFactors.push(`Anemia (Hemoglobin: ${factors.hemoglobin} g/dL)`);
  }

  if (factors.bloodGlucose !== undefined && factors.bloodGlucose >= 100) {
    riskFactors.push(`Elevated blood glucose (${factors.bloodGlucose} mg/dL)`);
  }

  return riskFactors;
}
