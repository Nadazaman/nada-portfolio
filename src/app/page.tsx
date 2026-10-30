"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";

type Project = {
  id: string;
  title: string;
  description: string;
  image_url: string;
  category: string;
  gallery_images: string[] | null;
};

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentScreenshot, setCurrentScreenshot] = useState(0);

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookingName, setBookingName] = useState("");
  const [bookingEmail, setBookingEmail] = useState("");
  const [bookingDateTime, setBookingDateTime] = useState("");
  const [bookingAgenda, setBookingAgenda] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactStatus, setContactStatus] = useState("");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const appScreenshots = selectedProject
    ? (selectedProject.gallery_images ?? [])
        .filter((url) => url.trim() !== "")
        .map((url, index) => ({
          title: `Screenshot ${index + 1}`,
          url,
        }))
    : [];

  if (
    selectedProject &&
    appScreenshots.length === 0 &&
    selectedProject.image_url
  ) {
    appScreenshots.push({
      title: selectedProject.title,
      url: selectedProject.image_url,
    });
  }

  useEffect(() => {
    async function loadProjects() {
      try {
        const { data, error } = await supabase
          .from("projects")
          .select("id, title, description, category, image_url, gallery_images")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Supabase projects error:", error.message);
          setError("Projects could not be loaded. Please try again later.");
        } else {
          setProjects(data ?? []);
        }
      } catch (err) {
        console.error("Project loading failed:", err);
        setError(
          "Unable to connect to the projects database. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadProjects();
  }, []);

  return (
    <main>
      <nav className="navbar">
        <a href="#home" className="logo" onClick={() => setMenuOpen(false)}>
          NADA ZAMAN<span>.</span>
        </a>

        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? "✕" : "☰"}
        </button>

        <div className={`nav-links ${menuOpen ? "open" : ""}`}>
          <a href="#home" onClick={() => setMenuOpen(false)}>
            Home
          </a>
          <a href="#about" onClick={() => setMenuOpen(false)}>
            About
          </a>
          <a href="#projects" onClick={() => setMenuOpen(false)}>
            Projects
          </a>
          <a href="#contact" onClick={() => setMenuOpen(false)}>
            Contact
          </a>
        </div>
      </nav>

      <section className="hero" id="home">
        <div className="hero-content">
          <p className="eyebrow">WEB DESIGNER</p>

          <h1>
            Hello, I'm Nada Zaman.
            <br />
            <span>Designing ideas into experiences.</span>
          </h1>

          <p className="intro">
            I'm a Computer Science graduate passionate about UI/UX design, web
            design and digital creativity. I enjoy turning ideas into simple,
            meaningful digital experiences.
          </p>

          <a href="#projects" className="button">
            Explore my work ↗
          </a>
        </div>

        <div className="hero-image">
          <img src="/profile.jpg" alt="Portrait of Nada" />
        </div>
      </section>

      <section className="section" id="about">
        <p className="eyebrow">GET TO KNOW ME</p>
        <h2>About me</h2>
        <a
          href="/Nada-Zaman-Resume.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="button resume-button"
        >
          View My Resume ↗
        </a>

        <p>
          I'm a Computer Science graduate with a passion for technology and
          creativity. I enjoy exploring how design and technology come together
          to create meaningful digital experiences.
        </p>

        <div className="about-journey">
          <h3>My Journey</h3>
          <p>
            During my academic journey, I explored web development, machine
            learning and software development. Over time, I also developed an
            interest in UI/UX and digital design. I enjoy combining technical
            knowledge with creative thinking to build simple and user-friendly
            experiences.
          </p>
        </div>

        <div className="education">
          <h3>Education</h3>

          <div className="education-item">
            <span className="education-dot"></span>
            <div>
              <h4>B.Tech in Computer Science & Engineering</h4>
              <p>MES College of Engineering, Kuttippuram</p>
              <span>2022 – 2026 | CGPA: 8.63/10</span>
            </div>
          </div>

          <div className="education-item">
            <span className="education-dot"></span>
            <div>
              <h4>Higher Secondary Education</h4>
              <p>IU Higher Secondary School, Malappuram</p>
              <span>2019 – 2021</span>
            </div>
          </div>

          <div className="education-item">
            <span className="education-dot"></span>
            <div>
              <h4>High School</h4>
              <p>TALAL International School, Jeddah, KSA</p>
              <span>2007 – 2019</span>
            </div>
          </div>
        </div>

        <div className="about-skills">
          <h3>My Skills</h3>
          <div className="skills">
            {[
              "HTML & CSS",
              "JavaScript",
              "Python",
              "PHP",
              "MySQL",
              "Flask",
              "Machine Learning",
              "Figma",
              "Canva",
              "UI/UX Design",
              "Git & GitHub",
            ].map((skill) => (
              <span key={skill}>{skill}</span>
            ))}
          </div>
        </div>

        <div className="about-achievements">
          <h3>Internship & Achievements</h3>
          <ul>
            <li>
              Machine Learning / AI Intern – ICT Academy of Kerala (Sep 2024 –
              Oct 2024)
            </li>
            <li>Inventron 24-Hour Hackathon – 5th Prize (2024)</li>
            <li>Academic Excellence – CGPA 8.63/10</li>
          </ul>
        </div>
      </section>

      <section className="section" id="projects">
        <p className="eyebrow">MY RECENT WORK</p>
        <h2>Projects</h2>

        {loading && <p>Loading projects...</p>}

        {error && <p role="alert">{error}</p>}

        {!loading && !error && projects.length === 0 && (
          <p>My projects will appear here soon. Please check back later.</p>
        )}

        <div className="projects">
          {projects.map((project) => (
            <article className="project" key={project.id}>
              {project.image_url && (
                <img
                  src={project.image_url}
                  alt={project.title}
                  className="project-image"
                  onClick={() => {
                    setCurrentScreenshot(0);
                    setSelectedProject(project);
                  }}
                  style={{ cursor: "pointer" }}
                />
              )}

              <span>{project.category || "PROJECT"}</span>

              <h3>{project.title}</h3>
              <p>{project.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section contact" id="contact">
        <p className="eyebrow">LET&apos;S CONNECT</p>
        <h2>Have an opportunity?</h2>
        <p>I&apos;d love to hear from you. Send me a message below.</p>

        <div className="contact-details">
          <p>
            <strong>Email:</strong>{" "}
            <a href="mailto:nadazaman15@gmail.com">nadazaman15@gmail.com</a>
          </p>

          <p>
            <strong>Phone:</strong>{" "}
            <a href="tel:+918089445445">+91 8089445445</a>
          </p>

          <div className="social-links">
            <a
              href="https://github.com/Nadazaman"
              target="_blank"
              rel="noreferrer"
            >
              GitHub ↗
            </a>
            <a
              href="https://www.linkedin.com/in/nada-zaman-151003343/"
              target="_blank"
              rel="noreferrer"
            >
              LinkedIn ↗
            </a>
            {/* <a href="https://instagram.com/yourusername" target="_blank" rel="noreferrer">
        Instagram ↗
      </a> */}
          </div>
        </div>

        <form
          className="contact-form"
          onSubmit={async (e) => {
            e.preventDefault();
            setContactStatus("Sending your message...");

            try {
              const response = await fetch("/api/contact", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  name: contactName,
                  email: contactEmail,
                  message: contactMessage,
                }),
              });

              const result = await response.json();

              if (!response.ok) {
                throw new Error(result.error || "Something went wrong.");
              }

              setContactStatus("Your message has been sent successfully!");

              setContactName("");
              setContactEmail("");
              setContactMessage("");
            } catch (error) {
              setContactStatus(
                error instanceof Error
                  ? error.message
                  : "Unable to send your message. Please try again.",
              );
            }
          }}
        >
          <label htmlFor="contact-name">Your Name</label>
          <input
            id="contact-name"
            name="name"
            type="text"
            placeholder="Enter your name"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            required
          />

          <label htmlFor="contact-email">Your Email</label>
          <input
            id="contact-email"
            name="email"
            type="email"
            placeholder="Enter your email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            required
          />

          <label htmlFor="contact-message">Your Message</label>
          <textarea
            id="contact-message"
            name="message"
            placeholder="Write your message..."
            rows={5}
            value={contactMessage}
            onChange={(e) => setContactMessage(e.target.value)}
            required
          />

          <button type="submit" className="button">
            Send Message ↗
          </button>

          {contactStatus && <p role="status">{contactStatus}</p>}
        </form>
      </section>

      <section className="section booking" id="booking">
        <p className="eyebrow">LET&apos;S MEET</p>
        <h2>Book a meeting</h2>
        <p>
          Interested in working together? Choose a convenient time and tell me
          what you&apos;d like to discuss.
        </p>

        <form
          className="contact-form"
          onSubmit={async (e) => {
            e.preventDefault();

            try {
              const response = await fetch("/api/book-meeting", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  name: bookingName,
                  email: bookingEmail,
                  dateTime: bookingDateTime,
                  agenda: bookingAgenda,
                }),
              });

              const result = await response.json();

              if (!response.ok) {
                alert(result.error || result.message || "Booking failed.");
                return;
              }

              alert(result.message || "Booking submitted successfully!");

              setBookingName("");
              setBookingEmail("");
              setBookingDateTime("");
              setBookingAgenda("");
            } catch {
              alert("Unable to submit your booking. Please try again.");
            }
          }}
        >
          <label htmlFor="booking-name">Full Name</label>
          <input
            id="booking-name"
            type="text"
            value={bookingName}
            onChange={(e) => setBookingName(e.target.value)}
            placeholder="Enter your full name"
            required
          />

          <label htmlFor="booking-email">Email Address</label>
          <input
            id="booking-email"
            type="email"
            value={bookingEmail}
            onChange={(e) => setBookingEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />

          <label htmlFor="booking-date">Preferred Date and Time</label>
          <input
            id="booking-date"
            type="datetime-local"
            value={bookingDateTime}
            onChange={(e) => setBookingDateTime(e.target.value)}
            min={new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
              .toISOString()
              .slice(0, 16)}
            required
          />

          <label htmlFor="booking-agenda">Reason for Meeting / Agenda</label>
          <textarea
            id="booking-agenda"
            value={bookingAgenda}
            onChange={(e) => setBookingAgenda(e.target.value)}
            placeholder="What would you like to discuss?"
            rows={5}
            required
          />

          <button type="submit" className="button">
            Request a Meeting ↗
          </button>
        </form>
      </section>

      <footer>
        <a href="#home" className="logo">
          NADA ZAMAN<span>.</span>
        </a>
        <p>Designed with curiosity. Built with purpose.</p>
        <a href="#home">Back to top ↑</a>
      </footer>
      {selectedProject && (
        <div className="project-modal" onClick={() => setSelectedProject(null)}>
          <div
            className="project-modal-content"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="project-modal-close"
              onClick={() => setSelectedProject(null)}
              aria-label="Close project image"
            >
              ×
            </button>

            {appScreenshots.length > 0 && (
              <div className="screenshot-carousel">
                <button
                  className="carousel-arrow"
                  onClick={() =>
                    setCurrentScreenshot(
                      (currentScreenshot - 1 + appScreenshots.length) %
                        appScreenshots.length,
                    )
                  }
                  aria-label="Previous screenshot"
                >
                  ‹
                </button>

                <img
                  src={appScreenshots[currentScreenshot].url}
                  alt={appScreenshots[currentScreenshot].title}
                  className="project-modal-image"
                />

                <button
                  className="carousel-arrow"
                  onClick={() =>
                    setCurrentScreenshot(
                      (currentScreenshot + 1) % appScreenshots.length,
                    )
                  }
                  aria-label="Next screenshot"
                >
                  ›
                </button>
              </div>
            )}

            {appScreenshots.length > 1 && (
              <div className="carousel-dots">
                {appScreenshots.map((screenshot, index) => (
                  <button
                    key={`${screenshot.url}-${index}`}
                    className={`carousel-dot ${
                      currentScreenshot === index ? "active" : ""
                    }`}
                    onClick={() => setCurrentScreenshot(index)}
                    aria-label={`Show ${screenshot.title}`}
                  />
                ))}
              </div>
            )}

            <span>{selectedProject.category || "PROJECT"}</span>

            <h2>{selectedProject.title}</h2>
            <p>{selectedProject.description}</p>
          </div>
        </div>
      )}
    </main>
  );
}
