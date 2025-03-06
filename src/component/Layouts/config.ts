export const cssFiles = [
  "/assets/css/font-awesome.min.css",
  "/assets/css/animate.min.css",
  "/assets/css/magnific-popup.css",
  "/assets/css/helper.css",
  "/assets/css/bootstrap.min.css",
  "/assets/css/style.css",
  "/assets/css/swiper-bundle.min.css",
  "/assets/css/unit-test.css",
  "/assets/css/validnavs.css"
];

export const jsFiles = [
  {
      src: "https://code.jquery.com/jquery-3.2.1.slim.min.js",
      integrity:
        "sha384-KJ3o2DKtIkvYIK3UENzmM7KCkRr/rE9/Qpg6aAZGJwFDMVNA/GpGFF93hXpG5KkN",
      crossOrigin: "anonymous",
    },
    { src: "/assets/js/jquery-3.6.0.min.js" },
    { src: "/assets/js/bootstrap.bundle.min.js" },  
    { src: "/assets/js/jquery.appear.js" },
    { src: "/assets/js/swiper-bundle.min.js" },
    { src: "/assets/js/progress-bar.min.js" },
    { src: "/assets/js/isotope.pkgd.min.js" },
    { src: "/assets/js/imagesloaded.pkgd.min.js" },
    { src: "/assets/js/magnific-popup.min.js" },
    { src: "/assets/js/count-to.js" },
    { src: "/assets/js/jquery.nice-select.min.js" },
    { src: "/assets/js/jquery.scrolla.min.js" },
    { src: "/assets/js/YTPlayer.min.js" },
    { src: "/assets/js/validnavs.js" },
    { src: "/assets/js/gsap.js" },
    { src: "/assets/js/ScrollTrigger.min.js" },
    { src: "/assets/js/rangeSlider.min.js" },
    { src: "/assets/js/jquery-ui.min.js" },
    { src: "/assets/js/SplitText.min.js" },
    { src: "/assets/js/main.js" }
];

export const importCSS = (href: string) => {
  return new Promise<void>((resolve, reject) => {
    if (!document.querySelector(`link[href="${href}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      link.onload = () => resolve();
      link.onerror = () => reject();
      document.head.appendChild(link);
    } else {
      resolve();
    }
  });
};

export const importScript = (
  src: string,
  integrity?: string,
  crossOrigin?: string
) => {
  return new Promise<void>((resolve, reject) => {
    if (!document.querySelector(`script[src="${src}"]`)) {
      const script = document.createElement("script");
      script.src = src;
      script.async = false;
      if (integrity) {
        script.integrity = integrity;
      }
      if (crossOrigin) {
        script.crossOrigin = crossOrigin;
      }
      script.onload = () => resolve();
      script.onerror = () => reject();
      document.body.appendChild(script);
    } else {
      resolve();
    }
  });
};