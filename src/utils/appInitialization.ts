// App initialization utilities extracted from base.js
// This replaces the functionality from the original base.js file

import { Splide } from '@splidejs/splide'

declare global {
  interface Window {
    Splide: typeof Splide;
    ApexCharts: any;
  }
}

//-----------------------------------------------------------------------
// Template Settings
//-----------------------------------------------------------------------
export const Finapp = {
  //-------------------------------------------------------------------
  // PWA Settings
  PWA: {
    enable: false, // Enable or disable PWA
  },
  //-------------------------------------------------------------------
  // Dark Mode Settings
  Dark_Mode: {
    default: true, // Set dark mode as main theme
    local_mode: { // Activate dark mode between certain times of the day
      enable: false, // Enable or disable local dark mode
      start_time: 20, // Start at 20:00
      end_time: 7, // End at 07:00
    },
    auto_detect: { // Auto detect user's preferences and activate dark mode
      enable: false,
    }
  },
  //-------------------------------------------------------------------
  // Right to Left (RTL) Settings
  RTL: {
    enable: false, // Enable or disable RTL Mode
  },
  //-------------------------------------------------------------------
  // Animations
  Animation: {
    goBack: false, // Go back page animation
  },
  //-------------------------------------------------------------------
  // Test Mode
  Test: {
    enable: true, // Enable or disable test mode
    word: "testmode", // The word that needs to be typed to activate test mode
    alert: true, // Enable or disable alert when test mode is activated
    alertMessage: "Test mode activated. Look at the developer console!" // Alert message
  }
  //-------------------------------------------------------------------
}

//-----------------------------------------------------------------------
// Service Workers
//-----------------------------------------------------------------------
export const initializeServiceWorker = () => {
  if (Finapp.PWA.enable) {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('__service-worker.js')
        .then(reg => console.log('service worker registered'))
        .catch(err => console.log('service worker not registered - there is an error.', err));
    }
  }
}

//-----------------------------------------------------------------------
// Page Loader
//-----------------------------------------------------------------------
export const initializePageLoader = () => {
  const loader = document.getElementById('bootstrap-loader');
  if (loader) {
    setTimeout(() => {
      loader.setAttribute("style", "pointer-events: none; opacity: 0; transition: 0.2s ease-in-out;");
      setTimeout(() => {
        loader.setAttribute("style", "display: none;")
      }, 1000);
    }, 450);
  }
}

//-----------------------------------------------------------------------
// Go Back Animation
//-----------------------------------------------------------------------
export const initializeGoBackButtons = () => {
  const goBackAnimation = () => {
    const pageBody = document.querySelector("body");
    if (pageBody) {
      pageBody.classList.add("animationGoBack")
      setTimeout(() => {
        window.history.go(-1);
      }, 300);
      setTimeout(() => {
        pageBody.classList.remove("animationGoBack");
      }, 500);
    }
  }

  const goBackButton = document.querySelectorAll(".goBack");
  goBackButton.forEach(function (el) {
    el.addEventListener("click", function () {
      if (Finapp.Animation.goBack) {
        goBackAnimation();
      } else {
        window.history.go(-1);
      }
    })
  })
}

//-----------------------------------------------------------------------
// RTL Support
//-----------------------------------------------------------------------
export const initializeRTL = () => {
  if (Finapp.RTL.enable) {
    const pageHTML = document.querySelector("html")
    const appSidebar = document.getElementById("sidebarPanel")

    if (pageHTML) pageHTML.dir = "rtl"
    document.querySelector("body")?.classList.add("rtl-mode")

    if (appSidebar != null) {
      appSidebar.classList.remove("panelbox-left")
      appSidebar.classList.add("panelbox-right")
    }

    document.querySelectorAll(".carousel-full, .carousel-single, .carousel-multiple, .carousel-small, .carousel-slider").forEach(function (el) {
      el.setAttribute('data-splide', '{"direction":"rtl"}')
    })
  }
}

//-----------------------------------------------------------------------
// Bootstrap Tooltip Initialization
//-----------------------------------------------------------------------
export const initializeTooltips = () => {
  let retryCount = 0
  const maxRetries = 10 // Reduced to 10 attempts (2 seconds total)
  const retryDelay = 200 // 200ms between retries
  const startTime = Date.now()
  const maxWaitTime = 5000 // Reduced to 5 seconds total wait time

  // Wait for Bootstrap to be available
  const initTooltips = () => {
    const currentTime = Date.now()

    // Check if we've exceeded maximum wait time
    if (currentTime - startTime > maxWaitTime) {
      console.warn('Bootstrap tooltips initialization timed out after 5 seconds. Continuing without tooltips.')
      return
    }

    // Check if we've exceeded maximum retry attempts
    if (retryCount >= maxRetries) {
      console.warn(`Bootstrap tooltips initialization failed after ${maxRetries} attempts. Continuing without tooltips.`)
      return
    }

    // Check if Bootstrap is available globally
    const bootstrap = (window as any).bootstrap

    if (bootstrap && bootstrap.Tooltip) {
      try {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
        tooltipTriggerList.map(function (tooltipTriggerEl) {
          return new bootstrap.Tooltip(tooltipTriggerEl)
        })
        console.log('Bootstrap tooltips initialized successfully')
      } catch (error) {
        console.error('Error initializing Bootstrap tooltips:', error)
      }
    } else {
      retryCount++
      if (retryCount <= 3 || retryCount % 5 === 0) {
        // Only log the first 3 attempts and then every 5th attempt to reduce console spam
        console.log(`Bootstrap not available yet, retrying... (attempt ${retryCount}/${maxRetries})`)
      }
      // Retry after a short delay
      setTimeout(initTooltips, retryDelay)
    }
  }

  // Initialize tooltips after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTooltips)
  } else {
    initTooltips()
  }
}

//-----------------------------------------------------------------------
// Fix for # href
//-----------------------------------------------------------------------
export const initializeHrefFix = () => {
  const aWithHref = document.querySelectorAll('a[href="#"], a[href="#!"]');
  aWithHref.forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
    });
  });
};

//-----------------------------------------------------------------------
// Main initialization function
//-----------------------------------------------------------------------
export const initializeApp = () => {
  initializeServiceWorker()
  initializePageLoader()
  initializeGoBackButtons()
  initializeRTL()
  initializeTooltips()
  initializeHrefFix()
}
