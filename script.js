const menuButton = document.querySelector(".menu-btn");
const closeButton = document.querySelector(".close-sidebar-btn");
const sidebar = document.querySelector(".sidebar-drawer");
const overlay = document.querySelector(".sidebar-overlay");
const body = document.body;

function closeMobileSidebar() {
    if (!sidebar || !overlay || !menuButton) return;

    sidebar.classList.remove("active");
    overlay.classList.remove("active");
    sidebar.setAttribute("aria-hidden", "true");
    sidebar.inert = true;
    menuButton.setAttribute("aria-expanded", "false");
    body.classList.remove("sidebar-open");
    menuButton.focus();
}

function openMobileSidebar() {
    if (!sidebar || !overlay || !menuButton) return;

    sidebar.classList.add("active");
    overlay.classList.add("active");
    sidebar.setAttribute("aria-hidden", "false");
    sidebar.inert = false;
    menuButton.setAttribute("aria-expanded", "true");
    body.classList.add("sidebar-open");
    closeButton?.focus();
}

menuButton?.addEventListener("click", openMobileSidebar);
closeButton?.addEventListener("click", closeMobileSidebar);
overlay?.addEventListener("click", closeMobileSidebar);
document.querySelectorAll(".sidebar-links a").forEach(link => {
    link.addEventListener("click", closeMobileSidebar);
});

document.addEventListener("keydown", event => {
    if (event.key === "Escape" && sidebar?.classList.contains("active")) {
        closeMobileSidebar();
    }
});

const currentPage = window.location.pathname.split("/").pop() || "index.html";
document.querySelectorAll(".nav-links a, .sidebar-links a").forEach(link => {
    const linkPage = link.getAttribute("href")?.split("#")[0];
    if (linkPage === currentPage && !link.getAttribute("href")?.startsWith("#")) {
        link.setAttribute("aria-current", "page");
    }
});

const revealTargets = document.querySelectorAll(".card, .feature-card, .price-card, .step-card");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if ("IntersectionObserver" in window && !prefersReducedMotion) {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("show");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    revealTargets.forEach(element => {
        element.classList.add("hidden");
        observer.observe(element);
    });
}

const form = document.querySelector(".contact-form");
if (form) {
    const button = form.querySelector("button[type='submit']");
    const status = form.querySelector(".form-status");

    form.addEventListener("submit", async event => {
        event.preventDefault();
        if (!button || !status) return;

        const originalButtonText = button.textContent;
        button.disabled = true;
        button.textContent = "Sending...";
        status.textContent = "";
        status.classList.remove("is-error", "is-success");

        try {
            const response = await fetch(form.action, {
                method: form.method,
                body: new FormData(form),
                headers: { Accept: "application/json" }
            });

            if (!response.ok) {
                status.textContent = "We couldn’t send your request just now. Please try again or call us on 07853 931199.";
                status.classList.add("is-error");
                return;
            }

            form.reset();
            status.textContent = "Thank you. Your request has been sent, and we’ll be in touch shortly.";
            status.classList.add("is-success");
        } catch {
            status.textContent = "We couldn’t connect to send your request. Please check your connection or call us on 07853 931199.";
            status.classList.add("is-error");
        } finally {
            button.disabled = false;
            button.textContent = originalButtonText || "Send Consultation Request";
        }
    });
}

const bookingDate = document.querySelector("#booking-date");
if (bookingDate instanceof HTMLInputElement) {
    const today = new Date();
    const localDate = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0")
    ].join("-");
    bookingDate.min = localDate;
}

const bookingMessage = document.querySelector("#booking-message");
const bookingMessageCount = document.querySelector("#booking-message-count");
if (bookingMessage instanceof HTMLTextAreaElement && bookingMessageCount) {
    const updateMessageCount = () => {
        bookingMessageCount.textContent = `${bookingMessage.value.length} / ${bookingMessage.maxLength}`;
    };

    bookingMessage.addEventListener("input", updateMessageCount);
    form?.addEventListener("reset", () => window.setTimeout(updateMessageCount));
    updateMessageCount();
}

const supportFinder = document.querySelector("#support-finder");
if (supportFinder instanceof HTMLFormElement) {
    const needSelect = supportFinder.querySelector("#support-need");
    const result = supportFinder.querySelector("#support-finder-result");
    const message = supportFinder.querySelector("#support-finder-message");
    const bookingLink = supportFinder.querySelector("#support-finder-link");
    const guidance = new Map([
        ["Benefits, grants and form help", "We can talk through forms, benefits and paperwork, and help make the next steps feel clearer."],
        ["Care planning and record keeping", "We can help you organise care information and think through a practical plan for the family."],
        ["Calls, appointments and referrals", "We can discuss help with appointments, follow-ups and calls to services."],
        ["Hospital discharge guidance", "We can talk through practical questions and arrangements after a hospital stay."],
        ["Home support and companionship", "We can discuss companionship at home and support that may give family carers a break."],
        ["Regular check-ins and reassurance", "We can explore whether regular check-ins and a reassuring point of contact may help."],
        ["Not sure yet / something else", "That’s okay. Start with a conversation and we’ll help you think through what might be useful."]
    ]);

    supportFinder.addEventListener("submit", event => {
        event.preventDefault();
        if (!(needSelect instanceof HTMLSelectElement) || !result || !message || !(bookingLink instanceof HTMLAnchorElement)) return;

        const selectedNeed = needSelect.value;
        const suggestion = guidance.get(selectedNeed);
        if (!suggestion) return;

        message.textContent = suggestion;
        bookingLink.href = `booking.html?service=${encodeURIComponent(selectedNeed)}`;
        result.hidden = false;
    });
}

const faqSearch = document.querySelector("#faq-search-input");
const faqItems = Array.from(document.querySelectorAll("#faq-list .faq-item"));
const faqSearchCount = document.querySelector("#faq-search-count");
const faqNoResults = document.querySelector("#faq-no-results");
if (faqSearch instanceof HTMLInputElement && faqSearchCount && faqNoResults) {
    const updateFaqResults = () => {
        const query = faqSearch.value.trim().toLocaleLowerCase();
        let visibleCount = 0;

        faqItems.forEach(item => {
            const matches = item.textContent?.toLocaleLowerCase().includes(query) ?? false;
            item.hidden = !matches;
            if (matches) visibleCount += 1;
        });

        faqSearchCount.textContent = query
            ? `Showing ${visibleCount} of ${faqItems.length} questions`
            : `Showing all ${faqItems.length} questions`;
        faqNoResults.hidden = visibleCount > 0;
    };

    faqSearch.addEventListener("input", updateFaqResults);
}

const planner = document.querySelector("#care-planner");
if (planner instanceof HTMLFormElement) {
    const storageKey = "beyond-hands-care-planner";
    const checkboxes = Array.from(planner.querySelectorAll("input[type='checkbox']"))
        .filter(input => input instanceof HTMLInputElement);
    const progress = document.querySelector("#planner-progress");
    const progressText = document.querySelector("#planner-progress-text");
    const status = document.querySelector("#planner-status");
    const resetButton = document.querySelector("#planner-reset");
    const printButton = document.querySelector("#planner-print");

    const updateProgress = () => {
        const checkedCount = checkboxes.filter(checkbox => checkbox.checked).length;
        if (progress instanceof HTMLProgressElement) {
            progress.value = checkedCount;
            progress.max = checkboxes.length;
        }
        if (progressText) {
            progressText.textContent = `${checkedCount} of ${checkboxes.length} steps checked`;
        }
    };

    try {
        const savedChecks = window.localStorage.getItem(storageKey);
        if (savedChecks) {
            const parsedChecks = JSON.parse(savedChecks);
            if (!Array.isArray(parsedChecks) || !parsedChecks.every(item => typeof item === "string")) {
                throw new Error("Saved checklist data is not in the expected format.");
            }
            checkboxes.forEach(checkbox => {
                checkbox.checked = parsedChecks.includes(checkbox.value);
            });
        }
    } catch {
        if (status) {
            status.textContent = "We couldn’t load saved checklist ticks from this browser. You can still use and print the checklist.";
            status.classList.add("is-error");
        }
    }

    updateProgress();

    checkboxes.forEach(checkbox => {
        checkbox.addEventListener("change", () => {
            updateProgress();
            try {
                const checkedValues = checkboxes.filter(item => item.checked).map(item => item.value);
                window.localStorage.setItem(storageKey, JSON.stringify(checkedValues));
                if (status) {
                    status.textContent = "Your checklist ticks are saved on this device.";
                    status.classList.remove("is-error");
                    status.classList.add("is-success");
                }
            } catch {
                if (status) {
                    status.textContent = "We couldn’t save your checklist ticks in this browser. You can still use and print the checklist.";
                    status.classList.remove("is-success");
                    status.classList.add("is-error");
                }
            }
        });
    });

    resetButton?.addEventListener("click", () => {
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        updateProgress();
        try {
            window.localStorage.removeItem(storageKey);
            if (status) {
                status.textContent = "Your checklist has been cleared.";
                status.classList.remove("is-error");
                status.classList.add("is-success");
            }
        } catch {
            if (status) {
                status.textContent = "The checklist is clear on this page, but saved ticks couldn’t be removed from this browser.";
                status.classList.remove("is-success");
                status.classList.add("is-error");
            }
        }
    });

    printButton?.addEventListener("click", () => window.print());
}

const bookingService = document.querySelector("#booking-service");
if (bookingService instanceof HTMLSelectElement) {
    const requestedService = new URLSearchParams(window.location.search).get("service");
    if (requestedService) {
        const matchingOption = Array.from(bookingService.options).find(option =>
            option.value === requestedService || option.textContent?.trim() === requestedService
        );
        if (matchingOption) bookingService.value = matchingOption.value;
    }
}

const navbar = document.querySelector(".navbar");
if (navbar) {
    const updateNavbar = () => navbar.classList.toggle("is-scrolled", window.scrollY > 12);
    updateNavbar();
    window.addEventListener("scroll", updateNavbar, { passive: true });
}

const footer = document.querySelector("footer");
if (footer) {
    const copyright = document.createElement("p");
    copyright.className = "copyright";
    copyright.textContent = `© ${new Date().getFullYear()} Beyond Hands. All rights reserved.`;
    footer.append(copyright);
}