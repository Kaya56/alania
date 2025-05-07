export function adjustElementToFullWidth(element) {
  if (!element || !(element instanceof HTMLElement)) return;

  // Obtenir le parent et les éléments siblings
  const parent = element.parentElement;
  if (!parent) return;

  // Obtenir tous les éléments siblings
  const siblings = Array.from(parent.children).filter(child => child !== element);
  
  // Calculer la largeur totale des siblings visibles et non animés
  let totalSiblingWidth = 0;
  
  siblings.forEach(sibling => {
    if (sibling instanceof HTMLElement) {
      const style = window.getComputedStyle(sibling);
      const isVisible = style.display !== 'none' && style.visibility !== 'hidden';
      const rect = sibling.getBoundingClientRect();
      const isInViewport = rect.left >= 0 && rect.right <= window.innerWidth;
      // Vérifier si l'élément a l'animation slide-up ou un transform
      const hasSlideUp = sibling.classList.contains('animate-slide-up');
      const hasTransform = style.transform !== 'none' && style.transform !== '';

      // Inclure uniquement les éléments visibles, dans le viewport, et sans animation slide-up ou transform
      if (isVisible && isInViewport && !hasSlideUp && !hasTransform) {
        totalSiblingWidth += rect.width;
      }
    }
  });

  // Obtenir la largeur du parent
  const parentRect = parent.getBoundingClientRect();
  const parentWidth = parentRect.width;

  // Calculer et appliquer la largeur à l'élément
  const targetWidth = parentWidth - totalSiblingWidth;
  
  // Appliquer la largeur en respectant min-w-0
  console.log("\n\n" + Math.max(0, targetWidth));
  element.style.width = `${Math.max(0, targetWidth)/2}px`;
  element.style.minWidth = '0';
}