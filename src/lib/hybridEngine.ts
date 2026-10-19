import { HYBRID_VERSION } from '../version';

export const getHybridVersion = () => HYBRID_VERSION;

export const triggerHybridBackup = (data: any) => {
  console.log(`[HybridEngine] Backup triggered for version ${HYBRID_VERSION}`, data);
  // Implementation of backup to server would go here
  localStorage.setItem(`backup_${HYBRID_VERSION}`, JSON.stringify(data));
};
