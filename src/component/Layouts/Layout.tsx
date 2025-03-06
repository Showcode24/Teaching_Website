import { useEffect } from "react";
import { cssFiles, importCSS, importScript, jsFiles } from "./config";
import Header from "../Header";
import Footer from "../Footer";

const Layout = ({ children }: { children: any }) => {

  useEffect(() => {
    const addedCssLinks: HTMLLinkElement[] = [];
    const addedScripts: HTMLScriptElement[] = [];

    const addCSSFiles = () => {
      cssFiles.forEach((href) => {
        importCSS(href).then(() => {
          const link = document.querySelector(
            `link[href="${href}"]`
          ) as HTMLLinkElement | null;
          if (link) {
            addedCssLinks.push(link);
          }
        });
      });
    };

    const addJSFiles = () => {
      jsFiles.forEach(({ src, integrity, crossOrigin }) => {
        importScript(src, integrity, crossOrigin).then(() => {
          const script = document.querySelector(
            `script[src="${src}"]`
          ) as HTMLScriptElement | null;
          if (script) {
            addedScripts.push(script);
          }
        });
      });
    };
    addCSSFiles();
    addJSFiles();
    return () => {
      // Remove CSS files
      addedCssLinks.forEach((link) => {
        if (link.parentNode) {
          link.parentNode.removeChild(link);
        }
      });

      // Remove JS files
      addedScripts.forEach((script) => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      });
    };

  }, [])

  return (
    <div>
      <Header />
      {children}
      <Footer />
    </div>
  )

};


export default Layout;