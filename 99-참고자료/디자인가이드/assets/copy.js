// 스와치 클릭 시 HEX 복사
document.addEventListener('click', (e) => {
  const sw = e.target.closest('.sw');
  if (!sw) return;
  const hex = sw.dataset.hex;
  if (!hex) return;
  navigator.clipboard?.writeText(hex);
  document.querySelectorAll('.sw.copied').forEach(n => n.classList.remove('copied'));
  sw.classList.add('copied');
  setTimeout(() => sw.classList.remove('copied'), 1200);
});
