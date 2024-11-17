const supabaseClient = supabase.createClient('https://hpvrsacknsmdgqlkivtb.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwdnJzYWNrbnNtZGdxbGtpdnRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAzOTIzODcsImV4cCI6MjA0NTk2ODM4N30.PtRBYEw4sPJoqTE6eRwlP33j6va-RFxKfoSdaAJqfFM');

async function fetchAlbums() {
    const { data, error } = await supabaseClient.from('albums').select('*');

    if (error) {
        console.error('Error fetching data:', error);
        return;
    }

    const albumGrid = document.querySelector('.album-grid');

    data.forEach(album => {
        // Create a clickable album link
        const albumLink = document.createElement('a');
        albumLink.href = `/Music-Rating/album.html?id=${album.album_id}`;
        albumLink.classList.add('album-item');

        const albumCover = document.createElement('img');
        albumCover.src = album.cover;
        albumCover.alt = `Cover of ${album.name}`;
        albumCover.classList.add('album-cover');

        const albumTitle = document.createElement('div');
        albumTitle.classList.add('album-title');
        albumTitle.textContent = album.name;

        const albumRating = document.createElement('div');
        albumRating.classList.add('album-rating');
        albumRating.textContent = `${album.rating}/100`;

        albumLink.appendChild(albumCover);
        albumLink.appendChild(albumTitle);
        albumLink.appendChild(albumRating);
        albumGrid.appendChild(albumLink);
    });
}

document.addEventListener('DOMContentLoaded', fetchAlbums);
