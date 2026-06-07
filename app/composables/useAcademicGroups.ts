export type AcademicGroup = {
  id: number;
  yearCode: string;
  yearLabel: string;
  studyYear: number;
  groupCode: string;
  groupLabel: string;
  sortOrder: number;
};

type SelectOption = { label: string; value: string | null; style: "neutral" };

export const useAcademicGroups = () => {
  const groups = useState<AcademicGroup[]>("academic-groups-data", () => []);
  const loading = useState<boolean>("academic-groups-loading", () => false);
  const error = useState<Error | null>("academic-groups-error", () => null);
  const api = useApi();

  const fetchAcademicGroups = async () => {
    if (groups.value.length) return;

    loading.value = true;
    try {
      const response = await api.get<{ items: AcademicGroup[]; count: number }>(
        "/academic-groups",
      );
      groups.value = response.items ?? [];
    } catch (fetchError) {
      error.value = fetchError as Error;
    } finally {
      loading.value = false;
    }
  };

  const yearOptions = computed<SelectOption[]>(() => {
    const uniqueYears = new Map<string, SelectOption>();
    for (const group of groups.value) {
      if (!uniqueYears.has(group.yearCode)) {
        uniqueYears.set(group.yearCode, {
          label: group.yearLabel,
          value: group.yearCode,
          style: "neutral",
        });
      }
    }
    return [
      { label: "Aucun", value: null, style: "neutral" },
      ...uniqueYears.values(),
    ];
  });

  const groupsByYear = computed<Record<string, SelectOption[]>>(() => {
    return groups.value.reduce<Record<string, SelectOption[]>>(
      (accumulator, group) => {
        if (!accumulator[group.yearCode]) accumulator[group.yearCode] = [];
        accumulator[group.yearCode]!.push({
          label: group.groupLabel,
          value: group.groupCode,
          style: "neutral",
        });
        return accumulator;
      },
      {},
    );
  });

  const getYearCodeForGroup = (groupCode: string | null): string | null => {
    if (!groupCode) return null;
    return (
      groups.value.find((group) => group.groupCode === groupCode)?.yearCode ??
      null
    );
  };

  const getStudyYearForYearCode = (yearCode: string | null): number | null => {
    if (!yearCode) return null;
    return (
      groups.value.find((group) => group.yearCode === yearCode)?.studyYear ??
      null
    );
  };

  const getYearCodeForStudyYear = (studyYear: number | null): string | null => {
    if (!studyYear) return null;
    return (
      groups.value.find((group) => group.studyYear === studyYear)?.yearCode ??
      null
    );
  };

  const getDefaultGroupForYearCode = (
    yearCode: string | null,
  ): string | null => {
    if (!yearCode) return null;
    return groupsByYear.value[yearCode]?.[0]?.value as string | null;
  };

  return {
    groups,
    loading,
    error,
    fetchAcademicGroups,
    yearOptions,
    groupsByYear,
    getYearCodeForGroup,
    getStudyYearForYearCode,
    getYearCodeForStudyYear,
    getDefaultGroupForYearCode,
  };
};
