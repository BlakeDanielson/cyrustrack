import { ConsumptionSession } from '@/types/consumption';

export interface StrainAutofillValues {
  strain_type: string;
  thc_percentage: number | undefined;
  purchased_legally: boolean;
  state_purchased: string;
}

export function getLatestStrainAutofill(
  strainName: string,
  sessions: ConsumptionSession[]
): StrainAutofillValues | null {
  const normalizedStrain = strainName.trim().toLowerCase();
  if (!normalizedStrain) {
    return null;
  }

  const matchingSessions = sessions.filter(
    (session) => session.strain_name.trim().toLowerCase() === normalizedStrain
  );
  if (matchingSessions.length === 0) {
    return null;
  }

  const recentMatch = matchingSessions.reduce((latest, session) => {
    const latestTimestamp = new Date(latest.created_at).getTime();
    const sessionTimestamp = new Date(session.created_at).getTime();
    return sessionTimestamp > latestTimestamp ? session : latest;
  }, matchingSessions[0]);

  return {
    strain_type: recentMatch.strain_type || '',
    thc_percentage: recentMatch.thc_percentage ?? undefined,
    purchased_legally: recentMatch.purchased_legally ?? true,
    state_purchased: recentMatch.state_purchased || '',
  };
}
