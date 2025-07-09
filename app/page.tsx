"use client"

import React, { useRef, useState, useEffect, useMemo } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, Moon, Sun, Menu, X, Mail, ChevronDown, Volume2 } from "lucide-react"
import { FaInstagram, FaSpotify, FaPodcast } from "react-icons/fa"
import { toast } from "sonner"
import { Toaster } from "sonner"
import AudioPlayer, { AudioPlayerHandle } from "@/components/ui/AudioPlayer";

interface Episode {
  id: number
  title: string
  guest: string
  description: string
  duration: string
  publishDate: string
  audioUrl: string
}

export default function PodcastPage() {
  const [darkMode, setDarkMode] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [currentlyPlaying, setCurrentlyPlaying] = useState<number | null>(null)
  const [email, setEmail] = useState("")
  const [visibleEpisodes, setVisibleEpisodes] = useState(3)
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const playerRef = useRef<AudioPlayerHandle | null>(null);

  useEffect(() => {
    fetch("/episodes.json")
      .then((res) => res.json())
      .then((data) => setEpisodes(data))
      .catch((err) => console.error("Failed to load episodes:", err))
  }, [])

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [darkMode])

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  const handlePlay = (episodeId: number) => {
    if (currentEpisode && currentEpisode.id === episodeId) {
      // Toggle play/pause
      if (isPlaying) {
        playerRef.current?.pause();
        setIsPlaying(false);
      } else {
        playerRef.current?.play();
        setIsPlaying(true);
      }
    } else {
      const ep = episodes.find((e) => e.id === episodeId);
      if (ep) {
        setCurrentEpisode(ep);
        setIsPlaying(true);
      }
    }
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      toast.success("Successfully subscribed!", {
        description: "Thank you for subscribing to Double-A Discourse updates.",
      })
      setEmail("")
    }
  }

  const loadMoreEpisodes = () => {
    setVisibleEpisodes((prev) => Math.min(prev + 3, episodes.length))
  }

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
    setMobileMenuOpen(false)
  }

  // Find the latest episode by publishDate
  const latestEpisode = useMemo(() => {
    if (!episodes.length) return null;
    return [...episodes].sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime())[0];
  }, [episodes]);

  // Sorted episodes for the grid
  const sortedEpisodes = useMemo(() => {
    return [...episodes].slice(1).sort((a, b) => {
      const aDate = new Date(a.publishDate).getTime();
      const bDate = new Date(b.publishDate).getTime();
      return sortOrder === 'desc' ? bDate - aDate : aDate - bDate;
    });
  }, [episodes, sortOrder]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <Image src="/logo.svg" alt="Double-A Discourse Logo" width={40} height={40} className="w-10 h-10" />
              <span className="font-heading text-xl font-bold text-gray-900 dark:text-white">Double-A Discourse</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => scrollToSection("episodes")}
                className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-900"
              >
                Episodes
              </button>
              <button
                onClick={() => scrollToSection("about")}
                className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-900"
              >
                About
              </button>
              <button
                onClick={() => scrollToSection("contact")}
                className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-900"
              >
                Contact
              </button>
              <button
                onClick={() => scrollToSection("subscribe")}
                className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-900"
              >
                Subscribe
              </button>
            </nav>

            {/* Dark Mode Toggle & Mobile Menu */}
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                aria-label="Toggle dark mode"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                aria-label="Toggle mobile menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700 animate-fade-in">
              <nav className="flex flex-col space-y-4">
                <button
                  onClick={() => scrollToSection("episodes")}
                  className="text-left text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                >
                  Episodes
                </button>
                <button
                  onClick={() => scrollToSection("about")}
                  className="text-left text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                >
                  About
                </button>
                <button
                  onClick={() => scrollToSection("contact")}
                  className="text-left text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                >
                  Contact
                </button>
                <button
                  onClick={() => scrollToSection("subscribe")}
                  className="text-left text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                >
                  Subscribe
                </button>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Logo + Tagline */}
            <div className="text-center lg:text-left animate-slide-up">
              <div className="flex justify-center lg:justify-start mb-6">
                <Image
                  src="/logo.svg"
                  alt="Double-A Discourse Logo"
                  width={120}
                  height={120}
                  className="w-24 h-24 lg:w-32 lg:h-32"
                />
              </div>
              <h1 className="font-heading text-4xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                Double-A Discourse
              </h1>
              <p className="text-xl lg:text-2xl text-gray-600 dark:text-gray-300 leading-relaxed">
                Dive into the backgrounds, stories, and faith journeys of our brothers and sisters!
              </p>
            </div>

            {/* Right: Latest Episode Card */}
            <div className="flex justify-center lg:justify-end animate-slide-up">
              {latestEpisode ? (
                <Card className="w-full max-w-xl bg-white dark:bg-gray-800 shadow-xl border-0 overflow-hidden">
                  <CardHeader className="bg-primary text-white flex items-center justify-between py-3 px-6">
                    <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 text-sm font-semibold px-3 py-1 rounded">
                      Latest Episode
                    </Badge>
                    <Volume2 className="w-5 h-5" />
                  </CardHeader>
                  <CardContent className="p-6">
                    <CardTitle className="font-heading text-2xl mb-2 text-gray-900 dark:text-white break-words">
                      {latestEpisode.title}
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400 mb-4 text-base">
                      with {latestEpisode.guest} • {latestEpisode.duration}
                    </CardDescription>
                    <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed whitespace-pre-line break-words">
                      {latestEpisode.description}
                    </p>
                    <div className="flex items-center space-x-4">
                      <Button
                        onClick={() => handlePlay(latestEpisode.id)}
                        className="bg-primary hover:bg-primary/90 text-white flex items-center space-x-2 px-6 py-2 text-base font-semibold rounded shadow"
                        aria-label={`${currentEpisode && currentEpisode.id === latestEpisode.id ? (isPlaying ? "Pause" : "Resume") : "Play"} latest episode`}
                      >
                        {currentEpisode && currentEpisode.id === latestEpisode.id ? (
                          isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                        <span>{currentEpisode && currentEpisode.id === latestEpisode.id ? (isPlaying ? "Pause" : "Resume") : "Listen Now"}</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="w-full max-w-xl bg-white dark:bg-gray-800 shadow-xl border-0 overflow-hidden">
                  <CardContent className="p-6 text-center">
                    <CardTitle className="font-heading text-2xl mb-2 text-gray-900 dark:text-white">
                      No Episodes Yet
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400 mb-4">
                      Stay tuned for our first episode!
                    </CardDescription>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Episodes Grid */}
      <section id="episodes" className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Recent Episodes
            </h2>
            {/* <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Catch up on our latest podcast episodes!
            </p> */}
          </div>

          {/* Sort Toggle */}
          <div className="flex justify-center mb-8 items-center gap-2">
            <span className="text-gray-700 dark:text-gray-200 font-medium">Sort by:</span>
            <div className="inline-flex rounded-md shadow-sm bg-gray-100 dark:bg-gray-800 p-1">
              <button
                className={`px-4 py-2 rounded-l-md font-medium focus:outline-none transition-colors duration-150 ${sortOrder === 'desc' ? 'bg-primary text-white' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                onClick={() => setSortOrder('desc')}
                aria-pressed={sortOrder === 'desc'}
              >
                Newest
              </button>
              <button
                className={`px-4 py-2 rounded-r-md font-medium focus:outline-none transition-colors duration-150 ${sortOrder === 'asc' ? 'bg-primary text-white' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                onClick={() => setSortOrder('asc')}
                aria-pressed={sortOrder === 'asc'}
              >
                Oldest
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {sortedEpisodes.slice(0, visibleEpisodes).map((episode, index) => (
              <Card
                key={episode.id}
                className="bg-white dark:bg-gray-800 hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700 animate-slide-up flex flex-col h-full"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader className="flex-shrink-0">
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="outline" className="text-xs">
                      {new Date(episode.publishDate).toLocaleDateString()}
                    </Badge>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{episode.duration}</span>
                  </div>
                  <CardTitle className="font-heading text-lg text-gray-900 dark:text-white line-clamp-2 min-h-[3.5rem]">
                    {episode.title}
                  </CardTitle>
                  <CardDescription className="text-primary font-medium">with {episode.guest}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col flex-grow">
                  <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 leading-relaxed flex-grow">
                    {episode.description}
                  </p>
                  <Button
                    onClick={() => handlePlay(episode.id)}
                    variant="outline"
                    className="w-full border-primary text-primary hover:bg-primary hover:text-white transition-colors mt-auto"
                    aria-label={`${currentEpisode && currentEpisode.id === episode.id ? (isPlaying ? "Pause" : "Resume") : "Play"} episode: ${episode.title}`}
                  >
                    {currentEpisode && currentEpisode.id === episode.id ? (
                      isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />
                    ) : (
                      <Play className="w-4 h-4 mr-2" />
                    )}
                    {currentEpisode && currentEpisode.id === episode.id ? (isPlaying ? "Pause" : "Resume") : "Play Episode"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {visibleEpisodes < sortedEpisodes.length && (
            <div className="text-center">
              <Button
                onClick={loadMoreEpisodes}
                variant="outline"
                className="border-primary text-primary hover:bg-primary hover:text-white transition-colors bg-transparent"
              >
                Load More Episodes
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Subscribe Banner */}
      <section id="subscribe" className="py-16 bg-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-3xl lg:text-4xl font-bold text-white mb-4">Never Miss an Episode</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Subscribe to get notified when new episodes are released and receive exclusive content.
          </p>

          <form onSubmit={handleSubscribe} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 bg-white dark:bg-gray-800 border-white dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-white focus:border-transparent"
                aria-label="Email address for subscription"
              />
              <Button type="submit" className="bg-white text-primary hover:bg-gray-100 font-medium px-8">
                <Mail className="w-4 h-4 mr-2" />
                Subscribe
              </Button>
            </div>
          </form>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Host Photo */}
            <div className="text-center lg:text-left">
              <div className="inline-block relative">
                <div className="w-64 h-64 lg:w-80 lg:h-80 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center mx-auto lg:mx-0 overflow-hidden">
                  <Image
                    src="/chibi-caleb.png"
                    alt="Caleb Yang chibi profile picture"
                    width={288}
                    height={288}
                    className="w-56 h-56 lg:w-72 lg:h-72 rounded-full object-cover"
                    priority
                  />
                </div>
              </div>
            </div>

            {/* Bio & Social */}
            <div className="text-center lg:text-left">
              <h2 className="font-heading text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Meet Your Host
              </h2>
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                  Welcome to Double-A Discourse! I'm Caleb Yang, someone who loves asking the big questions in life 
                  and having honest, meaningful conversations. I'm a senior studying computer science at UCI, and 
                  I enjoy playing Spikeball, jamming with friends, and yapping about anything and everything.
                </p>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-8">
                  This podcast is a space where we can learn from and encourage each other through discussions on 
                  how God has worked and is working in our lives. I hope you enjoy these conversations as much as I do!
                  I pray that we grow in wisdom, faith, and love as we journey alongside one another. It's my joy
                  to bring this podcast to you!
                </p>
              </div>

              {/* Social Icons */}
              <div className="flex justify-center lg:justify-start space-x-6">
                <a
                  href="https://www.instagram.com/caleb.jamesy/"
                  className="p-3 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-primary hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                  aria-label="Follow on Instagram"
                >
                  <FaInstagram className="w-5 h-5" />
                </a>
                <a
                  href="https://open.spotify.com/show/031japgTkhqRDUBZgvBpjL?si=3a81bdf7d37842cb"
                  className="p-3 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-primary hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                  aria-label="Listen on Spotify"
                >
                  <FaSpotify className="w-5 h-5" />
                </a>
                <a
                  href="https://doubleadiscourse.podbean.com/"
                  className="p-3 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-primary hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                  aria-label="Listen on Podbean"
                >
                  <FaPodcast className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 dark:bg-black text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {/* Logo & Description */}
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <Image src="/logo.svg" alt="Double-A Discourse Logo" width={32} height={32} className="w-8 h-8" />
                <span className="font-heading text-lg font-bold">Double-A Discourse</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Dive into the backgrounds, stories, and faith journeys of our brothers and sisters!
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-heading text-lg font-semibold mb-4">Quick Links</h3>
              <nav className="space-y-2">
                <button
                  onClick={() => scrollToSection("episodes")}
                  className="block text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-gray-900"
                >
                  Episodes
                </button>
                <button
                  onClick={() => scrollToSection("about")}
                  className="block text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-gray-900"
                >
                  About
                </button>
                <button
                  onClick={() => scrollToSection("subscribe")}
                  className="block text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-gray-900"
                >
                  Subscribe
                </button>
              </nav>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="font-heading text-lg font-semibold mb-4">Get in Touch</h3>
              <div className="space-y-2 text-gray-400">
                <p>Have a question or want to be featured on the podcast?</p>
                <a
                  href="mailto:doubleadiscourse@gmail.com"
                  className="block hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-gray-900"
                >
                  doubleadiscourse@gmail.com
                </a>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Double-A Discourse. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {currentEpisode && (
        <AudioPlayer
          ref={playerRef}
          audioUrl={currentEpisode.audioUrl}
          title={currentEpisode.title}
          guest={currentEpisode.guest}
          isPlaying={isPlaying}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
      )}
      <Toaster position="top-right" />
    </div>
  )
}
