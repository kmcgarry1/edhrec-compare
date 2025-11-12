import { ref, readonly } from "vue";

type OwnedFilter = boolean | null;

const showOwned = ref<OwnedFilter>(null);

export const useOwnedFilter = () => {
  const setOwnedFilter = (value: OwnedFilter) => {
    showOwned.value = value;
  };

  return {
    showOwned: readonly(showOwned),
    setOwnedFilter,
  };
};
