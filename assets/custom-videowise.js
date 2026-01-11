
document.addEventListener('DOMContentLoaded', () => {
  var KEY = 'videowiseWindowLocationReload';
  var urlSearchParams = new URLSearchParams(window.location.search);
  var url = new URL(window.location.href);

  if (urlSearchParams.has(KEY) === true) {
    var aEl = document.querySelector('a.header__nav__cart.js-cartToggle');

    if (aEl === null) {
      return;
    }

    setTimeout(() => {
      aEl.click();
      url.searchParams.delete(KEY);
      window.history.replaceState(null, '', url);
    }, 1000);
  } else {
    window.addEventListener('videowiseProductAddToCart', (event) => {
      url.searchParams.set(KEY, 'true');
      window.history.replaceState(null, '', url);
      window.location.reload();
    }, false);
  }  
}, false);

(function () {
  function fetchAndUpdateProduct(handle) {
    var jsonUrl = `/products/${handle}.json`;

    fetch(jsonUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch product JSON");
        }
        return response.json();
      })
      .then((data) => {
        if (!data.product || !data.product.id) {
          throw new Error("No product ID found");
        }

        var productId = data.product.id;

        if (window.__st) {
          window.__st.rid = productId;
          window.__st.pageurl = window.location.href;
          window.videowiseInfo.pid = productId;
        }

        if (
          typeof videowiseBulkTrigger === "function" &&
          typeof initVideowise === "function"
        ) {
          try {
            setTimeout(() => {
              window.videowiseIdsLoaded = [];
              window.videowiseBulkTrigger();
            }, 1000);
          } catch (err) {
            console.error("❌ Error calling Videowise functions:", err);
          }
        }
      })
      .catch((err) => console.error(err));
  }

  var originalPushState = history.pushState;
  history.pushState = function () {
    originalPushState.apply(history, arguments);
    handleUrlChange();
  };

  var originalReplaceState = history.replaceState;
  history.replaceState = function () {
    originalReplaceState.apply(history, arguments);
    handleUrlChange();
  };

  window.addEventListener("popstate", handleUrlChange);

  function handleUrlChange() {
    const handle = window.location.pathname.split("/").pop();
    if (handle) {
      fetchAndUpdateProduct(handle);
    }
  }

  handleUrlChange();
})();