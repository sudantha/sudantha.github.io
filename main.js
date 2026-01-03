// Main JS

// Navbar scroll effect
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// Smooth Scroll for Anchor Links (polishing standard behavior)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;

    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });

      // Update active state
      document.querySelectorAll('.nav-links a').forEach(link => link.classList.remove('active'));
      this.classList.add('active');
    }
  });
});

console.log("Personal Website Loaded Successfully!");

// Theme Toggle Logic
const themeToggleBtn = document.querySelector('.theme-toggle');
const root = document.documentElement;
const savedTheme = localStorage.getItem('theme');

// Apply saved theme on load
if (savedTheme) {
  root.setAttribute('data-theme', savedTheme);
  updateIcon(savedTheme);
}

themeToggleBtn.addEventListener('click', () => {
  const currentTheme = root.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';

  root.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateIcon(newTheme);
});

function updateIcon(theme) {
  themeToggleBtn.textContent = theme === 'light' ? '☀️' : '🌙';
}

// Math Captcha Logic
let captchaSum = 0;

function generateCaptcha() {
  const num1 = Math.floor(Math.random() * 10) + 1;
  const num2 = Math.floor(Math.random() * 10) + 1;
  captchaSum = num1 + num2;

  const questionEl = document.getElementById('captcha-question');
  if (questionEl) {
    questionEl.textContent = `What is ${num1} + ${num2}?`;
  }
}

// Initialize Captcha
generateCaptcha();

// Handle Form Submit
const contactForm = document.querySelector('.contact-form');

if (contactForm) {
  contactForm.removeAttribute('onsubmit'); // Remove inline handler

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userAnswer = parseInt(document.getElementById('captcha-answer').value);

    // 1. Verify Captcha
    if (userAnswer !== captchaSum) {
      alert('Incorrect Captcha answer. Please try again.');
      document.getElementById('captcha-answer').value = '';
      return;
    }

    // 2. Prepare Data
    const formData = new FormData(contactForm);
    const name = formData.get('name');
    const email = formData.get('email');
    const message = formData.get('message');

    // 3. Construct Mailto Link
    const subject = `New Message from ${name} (Personal Website)`;
    const body = `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;

    const mailtoLink = `mailto:your.email@example.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // 4. Open Email Client
    window.location.href = mailtoLink;

    alert('Opening your email client to send the message! 📧');
    contactForm.reset();
    generateCaptcha();
  });
}

// Render Credly Badges from Config
function renderBadges() {
  const badgeContainer = document.getElementById('badges-track');

  if (badgeContainer && typeof CREDLY_BADGES !== 'undefined') {
    // 1. Generate HTML (Duplicate list multiple times for seamless scrolling)
    // We create enough copies to ensure scrolling feels infinite
    const fullList = [...CREDLY_BADGES, ...CREDLY_BADGES, ...CREDLY_BADGES];

    const badgesHtml = fullList.map(id => `
      <div class="badge-wrapper">
        <div data-iframe-width="150" 
             data-iframe-height="270" 
             data-share-badge-id="${id}" 
             data-share-badge-host="https://www.credly.com">
        </div>
      </div>
    `).join('');

    badgeContainer.innerHTML = badgesHtml;

    // 2. Inject Credly Script
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = "//cdn.credly.com/assets/utilities/embed.js";
    document.body.appendChild(script);

    // 3. Mouse Wheel Interaction
    badgeContainer.addEventListener('wheel', (evt) => {
      evt.preventDefault();
      badgeContainer.scrollLeft += evt.deltaY;
    });

    // 4. Auto Scroll Logic
    let animationId;
    let isPaused = false;

    function autoScroll() {
      if (!isPaused) {
        badgeContainer.scrollLeft += 1; // Speed of scroll

        // Reset if reached end (Seamless loop illusion)
        // Note: This is a simple reset. For perfect pixel-seamlessness we'd need more complex DOM manipulation,
        // but given they are identical iframes, jumping back to 0 or 1/3 when near end works okay-ish or we just let it scroll.
        // Actually, with iframes, re-loading them by DOM swap is heavy.
        // Let's just scroll to the end. The user duplicated data 3 times, so it's long. 
        // Better: Detect max scroll and jump back to a matching position? 
        // For simplicity and stability with Iframes, we'll just scroll. 
        // If we hit the end, we can jump back to 0 if the content is perfectly repeated?
        if (badgeContainer.scrollLeft >= (badgeContainer.scrollWidth - badgeContainer.clientWidth)) {
          badgeContainer.scrollLeft = 0;
        }
      }
      animationId = requestAnimationFrame(autoScroll);
    }

    // Start Auto Scroll
    animationId = requestAnimationFrame(autoScroll);

    // Pause on Hover
    badgeContainer.addEventListener('mouseenter', () => isPaused = true);
    badgeContainer.addEventListener('mouseleave', () => isPaused = false);
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  generateCaptcha();
  renderBadges();
  initBlog();
  renderProjects();
});

// Projects Logic
function renderProjects() {
  const projectsContainer = document.getElementById('projects-list');
  if (!projectsContainer || typeof PROJECTS_DATA === 'undefined') return;

  projectsContainer.innerHTML = PROJECTS_DATA.map(project => `
    <div class="card project-card">
      <div class="card-header">
        <h3>${project.title}</h3>
        <span class="badge">${project.tech}</span>
      </div>
      <p>${project.description}</p>
      <div class="card-footer">
        <a href="${project.repoLink}" target="_blank">View Repo</a>
        <span>⭐ ${project.stars}</span>
      </div>
    </div>
  `).join('');
}

// Blog Logic
function initBlog() {
  const blogContainer = document.getElementById('blog-posts-container');
  if (!blogContainer || typeof BLOG_POSTS === 'undefined') return;

  blogContainer.innerHTML = BLOG_POSTS.map(post => `
    <article class="card">
      <h3>${post.title}</h3>
      <p class="date">${post.date}</p>
      <p>${post.preview}</p>
      <a href="javascript:void(0)" class="read-more" onclick="openPost('${post.slug}')">Read More →</a>
    </article>
  `).join('');
}

async function openPost(slug) {
  const modal = document.getElementById('blog-modal');
  const modalBody = document.getElementById('modal-body');

  modalBody.innerHTML = '<div class="loading-spinner">Loading article...</div>';
  modal.style.display = "block";
  document.body.style.overflow = "hidden"; // Prevent background scroll

  try {
    const response = await fetch(`./posts/${slug}.md`);
    if (!response.ok) throw new Error('Post not found');
    const markdown = await response.text();

    // Use Marked to parse markdown
    modalBody.innerHTML = marked.parse(markdown);
  } catch (error) {
    modalBody.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
  }
}

// Modal Close logic
document.addEventListener('click', (e) => {
  const modal = document.getElementById('blog-modal');
  if (e.target.className === 'close-modal' || e.target === modal) {
    modal.style.display = "none";
    document.body.style.overflow = "auto";
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === "Escape") {
    const modal = document.getElementById('blog-modal');
    if (modal.style.display === "block") {
      modal.style.display = "none";
      document.body.style.overflow = "auto";
    }
  }
});
// No more dynamic loading needed for badges
