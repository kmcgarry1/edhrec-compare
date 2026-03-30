import { readonly, ref } from "vue";

const uploadModalOpen = ref(false);

export const useUploadModal = () => {
  const openUploadModal = () => {
    uploadModalOpen.value = true;
  };

  const closeUploadModal = () => {
    uploadModalOpen.value = false;
  };

  const setUploadModalOpen = (value: boolean) => {
    uploadModalOpen.value = value;
  };

  return {
    uploadModalOpen: readonly(uploadModalOpen),
    openUploadModal,
    closeUploadModal,
    setUploadModalOpen,
  };
};
