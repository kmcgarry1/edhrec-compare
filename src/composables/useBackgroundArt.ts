import { readonly, ref } from "vue";

const artUrls = ref<string[]>([]);

const setBackgroundArtUrls = (urls: string[]) => {
  artUrls.value = urls;
};

export const useBackgroundArt = () => ({
  artUrls: readonly(artUrls),
  setBackgroundArtUrls,
});
