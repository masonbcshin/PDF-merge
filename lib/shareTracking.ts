/**
 * 로컬 스토리지 기반 공유 보상 시스템
 * 
 * 주의: 이 시스템은 로컬 스토리지 기반이며 클라이언트에서 조작이 가능합니다.
 * 프로덕션 환경에서는 서버 측 검증을 통한 보안 강화를 권장합니다.
 * 
 * 현재 구현은 데모/MVP 목적으로만 사용하세요.
 */

const STORAGE_KEY_CREDITS = 'pdf_merger_premium_credits';
const STORAGE_KEY_SHARES = 'pdf_merger_total_shares';
const MAX_CREDITS = 5;

/**
 * 현재 보유한 프리미엄 크레딧 수를 반환합니다.
 * @returns 프리미엄 크레딧 수
 */
export function getPremiumCredits(): number {
  if (typeof window === 'undefined') {
    return 0;
  }
  
  try {
    const credits = localStorage.getItem(STORAGE_KEY_CREDITS);
    const parsed = credits ? parseInt(credits, 10) : 0;
    return isNaN(parsed) ? 0 : Math.max(0, Math.min(parsed, MAX_CREDITS));
  } catch {
    return 0;
  }
}

/**
 * 프리미엄 크레딧이 있는지 확인합니다.
 * @returns 프리미엄 크레딧 보유 여부
 */
export function hasPremiumCredit(): boolean {
  return getPremiumCredits() > 0;
}

/**
 * 프리미엄 크레딧을 1개 추가합니다.
 * 최대 5개까지만 보유 가능합니다.
 */
export function addPremiumCredit(): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    const currentCredits = getPremiumCredits();
    const newCredits = Math.min(currentCredits + 1, MAX_CREDITS);
    localStorage.setItem(STORAGE_KEY_CREDITS, newCredits.toString());
    
    // 총 공유 횟수도 업데이트
    const totalShares = getTotalShares();
    localStorage.setItem(STORAGE_KEY_SHARES, (totalShares + 1).toString());
  } catch (error) {
    console.error('프리미엄 크레딧 저장 실패:', error);
  }
}

/**
 * 프리미엄 크레딧을 1개 사용합니다.
 * @returns 사용 성공 여부
 */
export function usePremiumCredit(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  
  try {
    const currentCredits = getPremiumCredits();
    if (currentCredits <= 0) {
      return false;
    }
    
    localStorage.setItem(STORAGE_KEY_CREDITS, (currentCredits - 1).toString());
    return true;
  } catch (error) {
    console.error('프리미엄 크레딧 사용 실패:', error);
    return false;
  }
}

/**
 * 총 공유 횟수를 반환합니다.
 * @returns 총 공유 횟수
 */
export function getTotalShares(): number {
  if (typeof window === 'undefined') {
    return 0;
  }
  
  try {
    const shares = localStorage.getItem(STORAGE_KEY_SHARES);
    const parsed = shares ? parseInt(shares, 10) : 0;
    return isNaN(parsed) ? 0 : Math.max(0, parsed);
  } catch {
    return 0;
  }
}

/**
 * 최대 크레딧 수를 반환합니다.
 * @returns 최대 크레딧 수
 */
export function getMaxCredits(): number {
  return MAX_CREDITS;
}

/**
 * 모든 공유 데이터를 초기화합니다. (테스트/디버그용)
 */
export function resetShareData(): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    localStorage.removeItem(STORAGE_KEY_CREDITS);
    localStorage.removeItem(STORAGE_KEY_SHARES);
  } catch (error) {
    console.error('공유 데이터 초기화 실패:', error);
  }
}
