// Atelify stüdyo — controls
// Proje, proje diyaloğu ve yeni tasarım formu buton bağlantıları.
// Klasik script: tüm studio/app/*.js dosyaları aynı global kapsamı paylaşır ve
// studio.html'deki numara sırasıyla yüklenir. Sırayı değiştirme.


function bindProjectControls() {
  newProjectButtons.forEach((button) => {
    button.addEventListener("click", openNewProjectDialog);
  });

  selectProjectsToggle?.addEventListener("click", enterProjectSelectionMode);
  projectSelectCancelButton?.addEventListener("click", exitProjectSelectionMode);
  projectSelectAllButton?.addEventListener("click", toggleAllProjectSelection);
  projectSelectDeleteButton?.addEventListener("click", requestBulkProjectDelete);

  window.addEventListener("beforeunload", () => {
    flushProjectSave();
  });
}

function bindProjectDialogControls() {
  projectDialogForm?.addEventListener("submit", handleProjectDialogSubmit);
  projectDialogCancelButtons.forEach((button) => {
    button.addEventListener("click", closeProjectDialog);
  });
  projectNameInput?.addEventListener("input", () => {
    setProjectDialogError("");
    updateProjectDialogCreateState();
  });
  projectDetailProductButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setProjectDialogError("");
      setProjectDetailButtonSelection(projectDetailProductButtons, button.dataset.projectProduct || "", "projectProduct");
      clearProjectDetailShapeSelection();
      updateProjectDialogCreateState();
    });
  });
  projectDetailShapeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (button.disabled || button.hidden) return;
      setProjectDialogError("");
      setProjectDetailButtonSelection(projectDetailShapeButtons, button.dataset.projectShape || "", "projectShape");
      updateProjectDialogCreateState();
    });
  });
  projectDetailMetalButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (button.disabled || button.hidden) return;
      setProjectDialogError("");
      setProjectDetailButtonSelection(projectDetailMetalButtons, button.dataset.projectMetal || "", "projectMetal");
      updateProjectDialogCreateState();
    });
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && projectDialog && !projectDialog.hidden) {
      closeProjectDialog();
    }
  });
}

function bindNewDesignControls() {
  document.querySelectorAll("[data-chip-group] .option-chip").forEach((chip) => {
    chip.dataset.defaultSelected = chip.classList.contains("is-selected") ? "1" : "0";
  });
  if (uploadLabel && !uploadLabel.dataset.defaultText) {
    uploadLabel.dataset.defaultText = uploadLabel.textContent;
  }
  const uploadHint = document.querySelector("[data-upload-hint]");
  if (uploadHint && !uploadHint.dataset.defaultText) {
    uploadHint.dataset.defaultText = uploadHint.textContent;
  }

  document.querySelectorAll("[data-chip-group]").forEach((group) => {
    group.querySelectorAll(".option-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        if (isSketchGenerating && ["product-type", "product-shape", "design-mode"].includes(group.dataset.chipGroup)) return;
        group.querySelectorAll(".option-chip").forEach((item) => {
          item.classList.toggle("is-selected", item === chip);
        });

        if (group.dataset.chipGroup === "count") {
          updateDraftCost();
          if (newDesignStudio?.classList.contains("has-results")) {
            clearSketchResults();
            setSketchStatus("Görsel sayısı değişti. Yeni ayarla tekrar oluşturabilirsin.");
          }
        }

        if (group.dataset.chipGroup === "finish-count") {
          updateFinishCost();
        }

        if (group.dataset.chipGroup === "metal") {
          updateDesignSelectionSummary();
          updateSideEmblemDefaultThumbs();
          updateSidePrintPreviews();
        }

        if (["product-type", "product-shape", "design-mode"].includes(group.dataset.chipGroup)) {
          if (group.dataset.chipGroup === "product-type") {
            enforceProductShapeSelection();
            applyProductMetalUI();
          }
          updateDesignSelectionSummary();
          renderFinishPreview(getSelectedFormInfo());
          renderMockupPreview(getSelectedFinishInfo());
          // Yüzey işlemi (detaylı/minimalist) değişince önceki çıktılar ekranda
          // kalsın; sadece ürün tipi/şekli değişince eski sonuçları temizle.
          const clearsSketchResults =
            group.dataset.chipGroup === "product-type" ||
            group.dataset.chipGroup === "product-shape";
          if (newDesignStudio?.classList.contains("has-results")) {
            if (clearsSketchResults) {
              clearSketchResults();
              setSketchStatus("Ürün veya şekil değişti. Yeni prompt ile tekrar görsel oluştur.");
            } else {
              setSketchStatus("Yüzey işlemi değişti. Mevcut görseller durur; yeni üretim seçilen ayarla yapılır.");
            }
          }
        }

        if (group.dataset.chipGroup === "ring-shape") {
          syncRingMoldSizeOptions();
          renderFinishPreview(getSelectedFormInfo());
        }

        if (group.dataset.chipGroup === "ring-mold") {
          renderFinishPreview(getSelectedFormInfo());
        }

        if (["mockup-count", "mockup-resolution"].includes(group.dataset.chipGroup)) {
          updateMockupCost();
        }

        if (["metal", "ring-shape", "ring-mold", "surface", "stone", "background", "finish-count"].includes(group.dataset.chipGroup)) {
          if (newDesignStudio?.classList.contains("has-finish-result")) {
            setFinishStatusMessage("Ürün görseli seçenekleri güncellendi. Mevcut sonuçlar durur; yeni üretim yanına eklenir.");
          }
        }

        if (["scene", "ratio", "mockup-count", "mockup-resolution"].includes(group.dataset.chipGroup)) {
          const activePanelHasResults = Boolean(
            (activeVisualizationPanel() || document).querySelector("[data-mockup-result-card]")
          );
          if (activePanelHasResults) {
            setMockupStatusMessage("Seçenekler güncellendi. Mevcut görseller durur; yeni üretim seçilen ayarla yapılır.");
          }
        }

        queueActiveProjectSave();
      });
    });
  });

  updateDraftCost();
  updateFinishCost();
  updateMockupCost();
  updateDesignSelectionSummary();
  setWorkflowForSketchStage();

  document.querySelectorAll("[data-stage-target]").forEach((step) => {
    step.addEventListener("click", () => openDesignStage(step.dataset.stageTarget));
    step.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openDesignStage(step.dataset.stageTarget);
      }
    });
  });

  uploadInput?.addEventListener("change", () => {
    if (isSketchGenerating) return;
    const file = uploadInput.files?.[0];
    const fileName = file?.name;
    if (uploadLabel) uploadLabel.textContent = uploadLabel.dataset.defaultText || "Tasarım görseli yükle";

    const previewImg = document.querySelector("[data-reference-preview]");
    const previewShell = document.querySelector("[data-reference-preview-shell]");
    const dropzone = document.querySelector("[data-upload-dropzone]");
    const hintSpan = document.querySelector("[data-upload-hint]");

    if (previewImg) {
      if (file && file.type.startsWith("image/")) {
        releaseReferencePreviewObjectUrl();
        const objectUrl = createStudioObjectUrl(file);
        referencePreviewObjectUrl = objectUrl;
        previewImg.src = objectUrl;
        previewImg.dataset.referenceFileName = file.name;
        delete previewImg.dataset.referenceDataUrl;
        delete previewImg.dataset.referenceThumbnailUrl;
        previewImg.hidden = false;
        previewShell?.removeAttribute("hidden");
        dropzone?.classList.add("has-preview");
        storeReferenceDataForFile(file, previewImg);
        if (hintSpan) hintSpan.textContent = currentUploadHintText();
      } else {
        releaseReferencePreviewObjectUrl();
        releaseImageElement(previewImg);
        delete previewImg.dataset.referenceDataUrl;
        delete previewImg.dataset.referenceFileName;
        delete previewImg.dataset.referenceThumbnailUrl;
        previewImg.hidden = true;
        previewShell?.setAttribute("hidden", "");
        dropzone?.classList.remove("has-preview");
        if (hintSpan) hintSpan.textContent = currentUploadHintText();
      }
    }

    setSketchStatus(
      fileName
        ? "Tasarım hazır. Önceki sonuçlar projede tutuldu; yeni görsel oluşturunca listeye eklenir."
        : "",
      "success"
    );
    queueActiveProjectSave();
  });

  const referenceDropzone = document.querySelector("[data-upload-dropzone]");
  if (referenceDropzone && uploadInput) {
    let dragDepth = 0;
    const clearDragState = () => {
      dragDepth = 0;
      referenceDropzone.classList.remove("is-dragover");
    };
    referenceDropzone.addEventListener("dragenter", (event) => {
      if (isSketchGenerating) return;
      event.preventDefault();
      dragDepth += 1;
      referenceDropzone.classList.add("is-dragover");
    });
    referenceDropzone.addEventListener("dragover", (event) => {
      if (isSketchGenerating) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = "copy";
    });
    referenceDropzone.addEventListener("dragleave", () => {
      dragDepth = Math.max(0, dragDepth - 1);
      if (dragDepth === 0) referenceDropzone.classList.remove("is-dragover");
    });
    referenceDropzone.addEventListener("drop", (event) => {
      event.preventDefault();
      clearDragState();
      if (isSketchGenerating) return;
      const file = event.dataTransfer?.files?.[0];
      if (!file || !file.type.startsWith("image/")) return;
      const transfer = new DataTransfer();
      transfer.items.add(file);
      uploadInput.files = transfer.files;
      uploadInput.dispatchEvent(new Event("change", { bubbles: true }));
    });
  }

  document.querySelectorAll("[data-generate-sketches]").forEach((button) => {
    button.addEventListener("click", () => {
      generateSketches(button);
    });
  });

  document.querySelectorAll("[data-sketch-card]").forEach(bindSketchCard);

  saveDesignButton?.addEventListener("click", saveSelectedDesign);
  document.querySelector("[data-save-finish-design]")?.addEventListener("click", () => {
    if (saveCurrentProjectState()) {
      setFinishStatusMessage("Ürün görseli bu projeye kaydedildi.", "success");
    }
  });
  document.querySelectorAll("[data-save-mockup-design]").forEach((button) => {
    button.addEventListener("click", () => {
      if (saveCurrentProjectState()) {
        setMockupStatusMessage("Mockup bu projeye kaydedildi.", "success");
      }
    });
  });

  continueFormButton?.addEventListener("click", () => {
    if (continueFormButton.disabled) return;
    enterFinishStage();
  });

  document.querySelectorAll("[data-back-to-form]").forEach((button) => {
    button.addEventListener("click", exitFinishStage);
  });

  document.querySelectorAll("[data-generate-finish]").forEach((button) => {
    button.addEventListener("click", () => {
      selectStageGenerationCount(button, "finish-count");
      generateFinishResults();
    });
  });

  document.querySelectorAll("[data-continue-mockup]").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.disabled) return;
      enterMockupStage();
    });
  });

  document.querySelectorAll("[data-back-to-finish]").forEach((button) => {
    button.addEventListener("click", exitMockupStage);
  });

  document.querySelectorAll("[data-generate-mockup]").forEach((button) => {
    button.addEventListener("click", () => {
      selectStageGenerationCount(button, "mockup-count");
      generateMockupResults();
    });
  });

  document.querySelector("[data-direct-form-upload]")?.addEventListener("change", handleDirectFormUpload);
  document.querySelector("[data-direct-finish-upload]")?.addEventListener("change", handleDirectFinishUpload);
  document.querySelectorAll("[data-design-source-toggle]").forEach((button) => {
    button.addEventListener("click", () => toggleDesignSourcePanel(button.dataset.designSourceToggle));
  });
  setupStageSourceSquares();
  document.querySelector("[data-ring-mold-info]")?.addEventListener("click", toggleRingMoldReference);
  syncRingMoldSizeOptions();
}
