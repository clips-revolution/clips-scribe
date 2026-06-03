document.addEventListener('DOMContentLoaded', () => {
  
  // 1. Background Grid Images Rotation (recreating BackgroundGrid.tsx client logic)
  const IMAGE_SETS = [
    [
      'https://picsum.photos/seed/a1/400/600',
      'https://picsum.photos/seed/a2/400/400',
      'https://picsum.photos/seed/a3/400/500',
      'https://picsum.photos/seed/a4/400/350',
      'https://picsum.photos/seed/a5/400/600',
      'https://picsum.photos/seed/a6/400/400',
      'https://picsum.photos/seed/a7/400/550',
      'https://picsum.photos/seed/a8/400/400',
      'https://picsum.photos/seed/a9/400/600',
      'https://picsum.photos/seed/a10/400/350',
      'https://picsum.photos/seed/a11/400/500',
      'https://picsum.photos/seed/a12/400/450',
      'https://picsum.photos/seed/a13/400/600',
      'https://picsum.photos/seed/a14/400/350',
      'https://picsum.photos/seed/a15/400/500',
      'https://picsum.photos/seed/a16/400/400',
    ],
    [
      'https://picsum.photos/seed/b1/400/500',
      'https://picsum.photos/seed/b2/400/600',
      'https://picsum.photos/seed/b3/400/400',
      'https://picsum.photos/seed/b4/400/550',
      'https://picsum.photos/seed/b5/400/400',
      'https://picsum.photos/seed/b6/400/600',
      'https://picsum.photos/seed/b7/400/350',
      'https://picsum.photos/seed/b8/400/500',
      'https://picsum.photos/seed/b9/400/450',
      'https://picsum.photos/seed/b10/400/600',
      'https://picsum.photos/seed/b11/400/400',
      'https://picsum.photos/seed/b12/400/500',
      'https://picsum.photos/seed/b13/400/350',
      'https://picsum.photos/seed/b14/400/600',
      'https://picsum.photos/seed/b15/400/400',
      'https://picsum.photos/seed/b16/400/550',
    ],
    [
      'https://picsum.photos/seed/c1/400/600',
      'https://picsum.photos/seed/c2/400/350',
      'https://picsum.photos/seed/c3/400/500',
      'https://picsum.photos/seed/c4/400/600',
      'https://picsum.photos/seed/c5/400/400',
      'https://picsum.photos/seed/c6/400/550',
      'https://picsum.photos/seed/c7/400/600',
      'https://picsum.photos/seed/c8/400/350',
      'https://picsum.photos/seed/c9/400/500',
      'https://picsum.photos/seed/c10/400/400',
      'https://picsum.photos/seed/c11/400/600',
      'https://picsum.photos/seed/c12/400/350',
      'https://picsum.photos/seed/c13/400/500',
      'https://picsum.photos/seed/c14/400/450',
      'https://picsum.photos/seed/c15/400/600',
      'https://picsum.photos/seed/c16/400/400',
    ]
  ];

  const bgGrid = document.getElementById('bg-grid');
  const bgImages = bgGrid.querySelectorAll('.grid-image-wrapper img');
  let currentSetIndex = 0;

  function loadGridImages(setIndex) {
    const set = IMAGE_SETS[setIndex];
    bgImages.forEach((img, i) => {
      if (set[i]) {
        img.src = set[i];
      }
    });
  }

  loadGridImages(currentSetIndex);

  setInterval(() => {
    bgGrid.style.opacity = '0.1';
    bgGrid.style.transition = 'opacity 0.8s ease';
    
    setTimeout(() => {
      currentSetIndex = (currentSetIndex + 1) % IMAGE_SETS.length;
      loadGridImages(currentSetIndex);
      bgGrid.style.opacity = '0.38';
    }, 800);
  }, 5000);

  bgGrid.style.opacity = '0.38';


  // 2. Interactive Studio Logic
  
  // UI Containers
  const stateUpload = document.getElementById('state-upload');
  const stateLoading = document.getElementById('state-loading');
  const stateResult = document.getElementById('state-result');

  // Password Protection Elements
  const loginOverlay = document.getElementById('login-overlay');
  const passwordInput = document.getElementById('password-input');
  const btnLogin = document.getElementById('btn-login');
  const loginError = document.getElementById('login-error');

  // Check saved password on load
  const savedPassword = sessionStorage.getItem('app_password');
  if (savedPassword) {
    loginOverlay.classList.add('hidden');
  }

  // Handle login submit
  async function handleLogin() {
    const password = passwordInput.value;
    if (!password) return;

    btnLogin.disabled = true;
    btnLogin.textContent = 'מתחבר...';
    loginError.style.display = 'none';

    try {
      const response = await fetch('/api/transcribe', {
        method: 'GET',
        headers: {
          'X-App-Password': password
        }
      });

      if (response.ok) {
        sessionStorage.setItem('app_password', password);
        loginOverlay.classList.add('hidden');
        passwordInput.value = '';
      } else {
        loginError.style.display = 'block';
        loginError.textContent = 'סיסמה שגויה, אנא נסה שנית.';
        passwordInput.value = '';
        passwordInput.focus();
      }
    } catch (error) {
      console.error('Login error:', error);
      loginError.style.display = 'block';
      loginError.textContent = 'שגיאת התחברות לשרת.';
    } finally {
      btnLogin.disabled = false;
      btnLogin.textContent = 'התחבר';
    }
  }

  btnLogin.addEventListener('click', handleLogin);
  passwordInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  });

  // Force show login overlay on unauthorized response
  function showLoginOverlay(withError = false) {
    sessionStorage.removeItem('app_password');
    loginOverlay.classList.remove('hidden');
    if (withError) {
      loginError.style.display = 'block';
      loginError.textContent = 'פג תוקף החיבור, אנא הזן סיסמה שנית.';
    } else {
      loginError.style.display = 'none';
    }
  }

  // State 1 Elements (Upload)
  const uploadZone = document.getElementById('upload-zone');
  const fileInput = document.getElementById('file-input');
  const fileInfoBar = document.getElementById('file-info-bar');
  const selectedFileName = document.getElementById('selected-file-name');
  const selectedFileSize = document.getElementById('selected-file-size');
  const btnClearFile = document.getElementById('btn-clear-file');
  const btnStartTranscription = document.getElementById('btn-start-transcription');
  
  // State 3 Elements (Result)
  const srtPreview = document.getElementById('srt-preview');
  const btnCopySrt = document.getElementById('btn-copy-srt');
  const btnDownloadSrt = document.getElementById('btn-download-srt');
  const btnTranscribeAnother = document.getElementById('btn-transcribe-another');
  
  // Toast notifications
  const toastNotification = document.getElementById('toast-notification');
  const toastMessage = document.getElementById('toast-message');

  // App State
  let selectedFile = null;
  let srtContent = '';

  // Setup Keyboard Accessibility for Upload Zone
  uploadZone.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fileInput.click();
    }
  });

  // Click handler for Upload Zone
  uploadZone.addEventListener('click', () => {
    fileInput.click();
  });

  // File selection change
  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      handleFileSelected(e.target.files[0]);
    }
  });

  // Drag and Drop Events
  ['dragenter', 'dragover'].forEach(eventName => {
    uploadZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      uploadZone.classList.add('dragover');
    }, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    uploadZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      uploadZone.classList.remove('dragover');
    }, false);
  });

  uploadZone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length > 0) {
      handleFileSelected(files[0]);
    }
  });

  // Handle selected file validation and display
  function handleFileSelected(file) {
    const isAudio = file.type.startsWith('audio/') || file.name.endsWith('.mp3') || file.name.endsWith('.wav') || file.name.endsWith('.m4a') || file.name.endsWith('.ogg');
    const isVideo = file.type.startsWith('video/') || file.name.endsWith('.mp4') || file.name.endsWith('.webm') || file.name.endsWith('.mpeg') || file.name.endsWith('.mpga');
    
    // Validate file type (any audio or video file supported by Whisper)
    if (!isAudio && !isVideo) {
      showToast('אנא בחר קובץ שמע או וידאו תקין.', true);
      return;
    }

    // Whisper size limit check (25MB)
    const maxSize = 25 * 1024 * 1024;
    if (file.size > maxSize) {
      showToast('גודל הקובץ עולה על 25MB. אנא בחר קובץ קטן יותר.', true);
      return;
    }

    selectedFile = file;

    // Display file name and size (formatted to MB)
    selectedFileName.textContent = file.name;
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    selectedFileSize.textContent = `${sizeInMB} MB`;

    // Transition State 1 components
    uploadZone.style.display = 'none';
    fileInfoBar.style.display = 'flex';
    btnStartTranscription.style.display = 'flex';
  }

  // Clear Selected File
  btnClearFile.addEventListener('click', () => {
    resetUpload();
  });

  function resetUpload() {
    selectedFile = null;
    fileInput.value = '';
    
    // UI elements visibility
    uploadZone.style.display = 'flex';
    fileInfoBar.style.display = 'none';
    btnStartTranscription.style.display = 'none';
    
    // Result panels visibility
    stateUpload.style.display = 'flex';
    stateLoading.style.display = 'none';
    stateResult.style.display = 'none';
    
    srtContent = '';
  }

  // Start Transcription Request
  btnStartTranscription.addEventListener('click', async () => {
    if (!selectedFile) return;

    // Transition container views inside the workspace-card
    stateUpload.style.display = 'none';
    stateLoading.style.display = 'flex';
    stateResult.style.display = 'none';

    try {
      const password = sessionStorage.getItem('app_password') || '';
      // Send the file content as binary in the request body
      // We pass the MIME type in Content-Type header so the server knows the format
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        headers: {
          'Content-Type': selectedFile.type || 'audio/mpeg',
          'X-App-Password': password
        },
        body: selectedFile
      });

      if (!response.ok) {
        if (response.status === 401) {
          showLoginOverlay(true);
          throw new Error('חיבור לא מורשה. סיסמה שגויה או פג תוקפה.');
        }
        let errorData = {};
        try {
          errorData = await response.json();
        } catch (e) {}
        throw new Error(errorData.details || errorData.error || `קוד שגיאה: ${response.status}`);
      }

      srtContent = await response.text();

      // Transition to results state
      stateLoading.style.display = 'none';
      stateResult.style.display = 'flex';
      srtPreview.textContent = srtContent;

      // Scroll preview to top
      srtPreview.scrollTop = 0;
      showToast('הכתוביות נוצרו בהצלחה!');

    } catch (error) {
      console.error('Transcription error:', error);
      // Restore UI upload state on error
      stateLoading.style.display = 'none';
      stateUpload.style.display = 'flex';
      
      showToast(`שגיאת תמלול: ${error.message}`, true);
    }
  });

  // Copy SRT content to clipboard
  btnCopySrt.addEventListener('click', async () => {
    if (!srtContent) return;

    try {
      await navigator.clipboard.writeText(srtContent);
      showToast('הועתק לקליפבורד!');
    } catch (err) {
      console.error('Could not copy text: ', err);
      const textArea = document.createElement('textarea');
      textArea.value = srtContent;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        showToast('הועתק לקליפבורד!');
      } catch (err2) {
        showToast('נכשלה העתקת התוכן.', true);
      }
      document.body.removeChild(textArea);
    }
  });

  // Download SRT file
  btnDownloadSrt.addEventListener('click', () => {
    if (!srtContent) return;

    const originalName = selectedFile ? selectedFile.name : 'transcription';
    const lastDotIndex = originalName.lastIndexOf('.');
    const baseName = lastDotIndex !== -1 ? originalName.substring(0, lastDotIndex) : originalName;
    const downloadName = `${baseName}.srt`;

    const blob = new Blob([srtContent], { type: 'text/srt;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = downloadName;
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  });

  // Reset to transcribe another file
  btnTranscribeAnother.addEventListener('click', () => {
    resetUpload();
  });

  // Toast Notification Helper
  let toastTimeout = null;
  function showToast(message, isError = false) {
    if (toastTimeout) {
      clearTimeout(toastTimeout);
    }

    toastMessage.textContent = message;
    
    if (isError) {
      toastNotification.classList.add('error');
    } else {
      toastNotification.classList.remove('error');
    }

    toastNotification.classList.add('show');

    toastTimeout = setTimeout(() => {
      toastNotification.classList.remove('show');
    }, 4000);
  }
});
