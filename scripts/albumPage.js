const supabaseClient = supabase.createClient('https://hpvrsacknsmdgqlkivtb.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwdnJzYWNrbnNtZGdxbGtpdnRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAzOTIzODcsImV4cCI6MjA0NTk2ODM4N30.PtRBYEw4sPJoqTE6eRwlP33j6va-RFxKfoSdaAJqfFM');

let isEditing = false; // Track if we are in edit mode
let currentTracks = []; // Store the current tracks data for editing

async function fetchAlbumTracks(albumId) {
    const { data: albumData, error: albumError } = await supabaseClient
        .from('albums')
        .select('*')
        .eq('album_id', albumId)
        .single();

    if (albumError) {
        console.error('Error fetching album data:', albumError);
        return;
    }

    // Set the album title to the h1 element
    const albumTitleElement = document.getElementById('album-title');
    albumTitleElement.textContent = albumData.name;

    const albumCover = document.getElementById('album-cover');
    albumCover.src = albumData.cover;

    const { data: tracks, error: tracksError } = await supabaseClient
        .from('songs')
        .select('*')
        .eq('album_id', albumId);

    if (tracksError) {
        console.error('Error fetching tracks:', tracksError);
        return;
    }

    currentTracks = tracks; // Store tracks for editing
    const trackList = document.getElementById('track-list');
    
    // Clear existing tracks
    trackList.innerHTML = ''; // Clear previous track list
    let totalRating = 0;

    tracks.forEach(track => {
        const trackItem = document.createElement('li');
        trackItem.classList.add('track-item');

        const trackName = document.createElement('div');
        trackName.classList.add('track-name');
        trackName.textContent = track.name;

        const trackRating = document.createElement('div');
        trackRating.classList.add('track-rating');
        trackRating.textContent = `${track.rating}/100`;

        trackItem.appendChild(trackName);
        trackItem.appendChild(trackRating);
        trackList.appendChild(trackItem);

        totalRating += track.rating; // Accumulate total rating
    });

    // Calculate and display the average rating
    const averageRating = Math.round(totalRating / tracks.length); // Round to nearest whole number
    const albumRatingElement = document.getElementById('album-rating');
    albumRatingElement.textContent = `Average Rating: ${averageRating}/100`;
}

// Function to toggle edit mode
function toggleEditMode() {
    isEditing = !isEditing;
    const trackList = document.getElementById('track-list');
    const saveButton = document.getElementById('save-button');
    const editButton = document.getElementById('edit-button');

    // Clear existing inputs and set up for editing
    trackList.querySelectorAll('.track-item').forEach((item, index) => {
        const trackRating = item.querySelector('.track-rating');
        if (isEditing) {
            // Create input field for editing
            const input = document.createElement('input');
            input.classList.add('edit-input');
            input.type = 'number';
            input.value = currentTracks[index].rating; // Set current rating
            input.min = 0; // Minimum rating
            input.max = 100; // Maximum rating
            trackRating.innerHTML = ''; // Clear current rating
            trackRating.appendChild(input);
        } else {
            // Restore rating display
            trackRating.textContent = `${currentTracks[index].rating}/100`;
        }
    });

    // Show or hide save button
    saveButton.style.display = isEditing ? 'block' : 'none';
    // Change button text based on editing mode
    editButton.textContent = isEditing ? 'Discard Changes' : 'Edit Ratings';
}

// Function to save all updated ratings
async function saveAllRatings() {
    const trackList = document.getElementById('track-list');
    const updatedRatings = [];

    trackList.querySelectorAll('.track-item').forEach((item, index) => {
        const input = item.querySelector('.edit-input');
        if (input) {
            updatedRatings.push({
                song_id: currentTracks[index].song_id,
                rating: parseInt(input.value)
            });
        }
    });

    // Update ratings in the database
    const updates = updatedRatings.map(track => {
        return supabaseClient
            .from('songs')
            .update({ rating: track.rating })
            .eq('song_id', track.song_id);
    });

    const results = await Promise.all(updates);
    const errors = results.filter(result => result.error);
    
    if (errors.length > 0) {
        console.error('Error updating ratings:', errors);
        alert('Failed to update ratings. Please try again.');
    } else {
        alert('Ratings updated successfully!');
        
        // Recalculate and display the new average rating
        currentTracks = updatedRatings; // Update currentTracks with new ratings
        fetchAlbumTracks(new URLSearchParams(window.location.search).get('id')); // Refresh album tracks

        toggleEditMode(); // Exit edit mode after saving
    }
}

// Function to discard changes
function discardChanges() {
    isEditing = false;
    const trackList = document.getElementById('track-list');
    const saveButton = document.getElementById('save-button');
    const editButton = document.getElementById('edit-button');

    // Restore original ratings
    trackList.querySelectorAll('.track-item').forEach((item, index) => {
        const trackRating = item.querySelector('.track-rating');
        trackRating.textContent = `${currentTracks[index].rating}/100`;
    });

    // Hide save button
    saveButton.style.display = 'none';
    // Change button text back to Edit Ratings
    editButton.textContent = 'Edit Ratings';
}

// Get album ID from URL
const urlParams = new URLSearchParams(window.location.search);
const albumId = urlParams.get('id');

if (albumId) {
    fetchAlbumTracks(albumId);
    document.getElementById('edit-button').addEventListener('click', toggleEditMode);
    document.getElementById('save-button').addEventListener('click', saveAllRatings);
}
