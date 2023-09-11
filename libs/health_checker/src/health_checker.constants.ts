export const HEALTH_CHECKER_CONFIG = 'HEALTH_CHECKER_CONFIG';

interface IDatabase {
  isEnable: boolean;
}
interface IHeap {
  isEnable: boolean;
  usedThreshold: number;
}
export interface IHealthCheckerOptions {}
