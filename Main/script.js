const track = document.querySelector(".image-track");
const images = track.getElementsByTagName("img");

let trackMoved = false;
let startX = 0;

const volumeSlider = document.getElementById('volumeSlider');

function isVolumeControl(e) {
    const volumeControls = document.querySelector('.audio-controls'); // Add this class to your volume controls container
    const rect = volumeControls.getBoundingClientRect();
    const x = e.clientX || (e.touches && e.touches[0].clientX);
    const y = e.clientY || (e.touches && e.touches[0].clientY);
    
    return x >= rect.left && 
           x <= rect.right && 
           y >= rect.top && 
           y <= rect.bottom;
}



// Profile

// IMAGE TRACK
// Initiate Variables
track.dataset.mouseDownAt = "0";
track.dataset.prevPercentage = "38";
track.dataset.percentage = "0";

track.style.transform = "translate(38%, 0%)";
// Also set initial object position for images
for(const image of images) {
    image.style.objectPosition = "70% center";
}

window.onmousedown = e => {
    if (isVolumeControl(e)) return;
    track.dataset.mouseDownAt = e.clientX;
    track.setAttribute('data-dragging', 'true');
    startX = e.clientX;
    trackMoved = false; // Reset the movement flag
}

window.onmouseup = () => {
    track.dataset.mouseDownAt = "0";
    track.dataset.prevPercentage = track.dataset.percentage;
    track.setAttribute('data-dragging', 'false'); 
    // Dont reset trackmoved here 
}

// Add this function to recalculate dimensions
function updateTrackDimensions() {
    // Reset the track position
    track.dataset.prevPercentage = "50";
    track.dataset.percentage = "0";
    track.style.transform = "translate(50%, 0%)";
    
    // Reset image positions
    for(const image of images) {
        image.style.objectPosition = "75% center";
    }
}

// Add resize listener
window.addEventListener('resize', updateTrackDimensions);


window.onmousemove = e => {
    if(track.dataset.mouseDownAt === "0") return;

    // Check if the track has moved more than a small threshold (e.g., 5 pixels)
    if(Math.abs(e.clientX - startX) > 5) {
        trackMoved = true;
    }
    

    const mouseDelta = parseFloat(track.dataset.mouseDownAt) - e.clientX;
    const maxDelta = window.innerWidth/2;

    const percentage = (mouseDelta / maxDelta) * -100;
    const nextPercentageUnconstrained = parseFloat(track.dataset.prevPercentage) + percentage;

    const nextPercentage = Math.max(Math.min(nextPercentageUnconstrained, 38), -75);

    track.dataset.percentage = nextPercentage;

    // Move the track
    track.animate({
        transform: `translate(${nextPercentage}%, 0%)`
    }, { duration: 1200, fill: "forwards" });

    // Calculate parallax position from center (50%)
    const parallaxPosition = `${50 + (nextPercentage / 2)}% center`;
    
    // Apply the same parallax position to all images
    for(const image of images) {
        image.animate({
            objectPosition: parallaxPosition
        }, { duration: 1200, fill: "forwards" });
    }
}

window.ontouchstart = e => {
    if (isVolumeControl(e)) return;
    track.dataset.mouseDownAt = e.touches[0].clientX;
    trackMoved = false;
}

window.ontouchend = () => {
    track.dataset.mouseDownAt = "0";
    track.dataset.prevPercentage = track.dataset.percentage;
}

window.ontouchmove = e => {
    if(track.dataset.mouseDownAt === "0") return;

    if(Math.abs(e.touches[0].clientX - startX) > 5) {
        trackMoved = true;
    }

    const touchDelta = parseFloat(track.dataset.mouseDownAt) - e.touches[0].clientX;
    const maxDelta = window.innerWidth / 2;

    const percentage = (touchDelta / maxDelta) * -100;
    const nextPercentageUnconstrained = parseFloat(track.dataset.prevPercentage) + percentage;
    const nextPercentage = Math.max(Math.min(nextPercentageUnconstrained, 50), -100);

    track.dataset.percentage = nextPercentage;

    track.animate({
        transform: `translate(${nextPercentage}%, 0%)`
    }, { duration: 1200, fill: "forwards" });

    // Calculate parallax position from center (50%)
    const parallaxPosition = `${50 + (nextPercentage / 2)}% center`;
    
    for(const image of images) {
        image.animate({
            objectPosition: parallaxPosition
        }, { duration: 1200, fill: "forwards" });
    }
}

// Prevent default drag behavior
track.ondragstart = e => {
    e.preventDefault();
}

// Cursor styling
track.addEventListener("mousedown", () => {
    track.style.cursor = "default";
});

track.addEventListener("mouseup", () => {
    track.style.cursor = "default";
});

// Prevent default touch moves
document.addEventListener('touchmove', function(e) {
  e.preventDefault();
}, { passive: false });

// Prevent scrolling with keyboard
document.addEventListener('keydown', function(e) {
    // Define keys to prevent
    const preventedKeys = [
        ' ',                // Space
        'PageUp',          // Page Up
        'PageDown',        // Page Down
        'End',             // End
        'Home',            // Home
        'ArrowLeft',       // Left
        'ArrowUp',         // Up
        'ArrowRight',      // Right
        'ArrowDown'        // Down
    ];
    
    if (preventedKeys.includes(e.key)) {
        e.preventDefault();
        return false;
    }
});


// Prevent mouse wheel scrolling
document.addEventListener('wheel', function(e) {
  e.preventDefault();
}, { passive: false });

// Prevent link pressing when moving track

document.querySelectorAll('.image-item a').forEach(link => {
    link.addEventListener('click', (e) => {
        if(trackMoved) {
            e.preventDefault();
            trackMoved = false; // Reset for next interaction
        }
    });
});

document.querySelectorAll('.image-item a').forEach(link => {
    link.addEventListener('touchend', (e) => {
        if(trackMoved) {
            e.preventDefault();
            trackMoved = false;
        }
    });
});



// Music


document.addEventListener('DOMContentLoaded', function() {
    const music = document.getElementById('bgMusic');
    const audioButton = document.querySelector('.audio-toggle');
    const volumeSlider = document.getElementById('volumeSlider');

    let isMuted = false;
    music.volume = volumeSlider.value;
    
    audioButton.addEventListener('click', () => {
        
        isMuted = !isMuted;
        if (isMuted) {
            preMute = music.volume;
            volumeSlider.value = 0;
            music.volume = 0;
            volumeSlider.style.setProperty('--volume-percentage', `${music.volume*500}`);
        } else { 
            volumeSlider.value = preMute;
            music.volume = preMute;
            volumeSlider.style.setProperty('--volume-percentage', `${preMute*500}`);
        }
        audioButton.setAttribute('data-muted', isMuted);
        audioButton.setAttribute('aria-label', isMuted ? 'Unmute' : 'Mute');
    });
    
    volumeSlider.addEventListener('input', function(e) {
        e.stopPropagation();
        music.volume = this.value;
        value = this.value * 500;
        this.style.setProperty('--volume-percentage', `${value}%`);
        e.stopPropagation();
        trackMoved = false;
    });

    volumeSlider.style.setProperty('--volume-percentage', `${volumeSlider.value*500}%`);
});



// Time

document.addEventListener('DOMContentLoaded', function() {
    const timeText = document.querySelector('.time');
    
    function updateTime() {
        /* Create a date object in EST/EDT */
        const options = {
            timeZone: 'America/New_York',
            hour: 'numeric',
            minute: '2-digit',
            hour12: false
        };
        
        const estTime = new Date().toLocaleTimeString('en-US', options);
        timeText.textContent = `${estTime} EST`;
    }

    /* Update immediately */
    updateTime();
    
    /* Update every second */
    setInterval(updateTime, 1000);
});

document.addEventListener('DOMContentLoaded', function() {
    const infoIcon = document.querySelector('.info-icon');
    const popup = document.getElementById('infoPopup');
    const closeButton = popup.querySelector('.close-button');
    const artistsText = document.querySelector('.artists-button-text');
    const artistsDetails = document.querySelector('.artists-details');

    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'popup-overlay';
    document.body.appendChild(overlay);

    function showPopup() {
        overlay.style.display = 'block';
        popup.style.display = 'block';
        
        // Trigger animations
        requestAnimationFrame(() => {
            overlay.style.animation = 'overlayFadeIn 0.3s forwards';
            popup.style.animation = 'boxFadeIn 0.3s forwards';
        });
    }

    function hidePopup() {
        overlay.style.animation = 'overlayFadeOut 0.3s forwards';
        popup.style.animation = 'boxFadeOut 0.3s forwards';
        
        // Remove elements after animation
        setTimeout(() => {
            overlay.style.display = 'none';
            popup.style.display = 'none';
        }, 300);
    }

    function toggleArtists() {
        if (artistsDetails.style.display === 'none' || !artistsDetails.style.display) {
            artistsDetails.style.display = 'block';
            artistsDetails.style.animation = 'boxFadeInNT 0.3s forwards';
        } else {
            artistsDetails.style.animation = 'boxFadeOutNT 0.3s forwards';
            setTimeout(() => {
                artistsDetails.style.display = 'none';
            }, 300);
        }
    }

    // Event listeners
    infoIcon.addEventListener('click', showPopup);
    closeButton.addEventListener('click', hidePopup);
    overlay.addEventListener('click', hidePopup);
    artistsText.addEventListener('click', toggleArtists);

    // Prevent popup from closing when clicking inside it
    popup.addEventListener('click', (e) => {
        e.stopPropagation();
    });
});

// Fuck mobile users <3
document.addEventListener('DOMContentLoaded', function(){
    const antiMobile = document.querySelector('.anti-mobile');
    const infoIcon = document.querySelector('.info-icon');
    const emailIcon = document.querySelector('.email-icon');
    

    if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)){
        // true for mobile device
        console.log("Mobile -- Skipping")
        antiMobile.style.display = 'block';
        infoIcon.style.display = 'none';
        emailIcon.style.display = 'none';
      } else {
        console.log("Desktop/PC");
        // antiMobile.style.display = 'block';
        // infoIcon.style.display = 'none';
        // emailIcon.style.display = 'none';
        return;
    }
}); 