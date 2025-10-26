async function loadImages() {
  const res = await fetch('/api/images');
  const images = await res.json();

  const gallery = document.getElementById('gallery');
  gallery.innerHTML = '';

  for (const img of images) {
    const card = document.createElement('div');
    card.className = "bg-white shadow-md rounded-lg overflow-hidden";

    const imageEl = document.createElement('img');
    imageEl.src = `/api/images/${img.id}`;
    imageEl.className = "w-full h-64 object-cover";

    const desc = document.createElement('div');
    desc.className = "p-4";
    desc.innerHTML = `<p class="text-xl text-gray-700">${img.description}</p>`;

    card.appendChild(imageEl);
    card.appendChild(desc);
    gallery.appendChild(card);
  }
}

loadImages();
