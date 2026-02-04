import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions, Platform, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';

export default function LandingPage() {
    const router = useRouter();
    const { width } = useWindowDimensions();
    const isDesktop = width > 768;

    const features = [
        {
            icon: 'people',
            title: 'Group Splitting',
            desc: 'Create groups for trips, roommates, or events. We do the math so you don\'t have to.'
        },
        {
            icon: 'flash',
            title: 'Instant Settlement',
            desc: 'Our algorithm minimizes transactions. Settle debts efficiently with fewer transfers.'
        },
        {
            icon: 'pie-chart',
            title: 'Smart Analytics',
            desc: 'Visualize your spending habits with stunning, interactive charts and trend analysis.'
        },
        {
            icon: 'shield-checkmark',
            title: 'Bank-Grade Security',
            desc: 'Your data is encrypted and secure. We prioritize your privacy above all else.'
        },
        {
            icon: 'globe',
            title: 'Multi-Currency',
            desc: 'Traveling abroad? Track expenses in any currency and convert automatically.'
        },
        {
            icon: 'notifications',
            title: 'Bill Reminders',
            desc: 'Never miss a payment again with automated upcoming bill notifications.'
        }
    ];

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* Navbar */}
                <View style={[styles.navbar, isDesktop && styles.navbarDesktop]}>
                    <View style={styles.logoContainer}>
                        <LinearGradient
                            colors={['#4F46E5', '#06B6D4']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.logoIcon}
                        >
                            <Text style={styles.logoText}>S</Text>
                        </LinearGradient>
                        <Text style={styles.brandName}>Splitora</Text>
                    </View>

                    {isDesktop && (
                        <View style={styles.navLinks}>
                            <Text style={styles.navLink}>Features</Text>
                            <Text style={styles.navLink}>How it Works</Text>
                            <Text style={styles.navLink}>Testimonials</Text>
                        </View>
                    )}

                    <View style={styles.authButtons}>
                        <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                            <Text style={styles.loginText}>Log in</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
                            <LinearGradient
                                colors={['#4F46E5', '#06B6D4']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.getStartedBtn}
                            >
                                <Text style={styles.getStartedText}>Get Started</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Hero Section */}
                <View style={styles.heroSection}>
                    <View style={styles.badgeContainer}>
                        <LinearGradient
                            colors={['rgba(79, 70, 229, 0.2)', 'rgba(6, 182, 212, 0.2)']}
                            style={styles.badge}
                        >
                            <View style={styles.badgeDot} />
                            <Text style={styles.badgeText}>NEW: SMART BUDGETING AI</Text>
                        </LinearGradient>
                    </View>

                    <Text style={styles.heroTitle}>
                        Master Your Money,{'\n'}
                        <Text style={styles.heroTitleHighlight}>Together.</Text>
                    </Text>

                    <Text style={styles.heroSubtitle}>
                        The modern way to track expenses, split bills, and reach financial goals with friends. Simple, transparent, and intelligent.
                    </Text>

                    <View style={styles.heroButtons}>
                        <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
                            <LinearGradient
                                colors={['#4F46E5', '#06B6D4']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.primaryHeroBtn}
                            >
                                <Text style={styles.primaryHeroBtnText}>Start for Free</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.secondaryHeroBtn}>
                            <Text style={styles.secondaryHeroBtnText}>View Demo</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Features Grid */}
                <View style={styles.featuresSection}>
                    <Text style={styles.sectionTitle}>Designed for Modern Finances</Text>
                    <Text style={styles.sectionSubtitle}>Everything you need to manage shared expenses and personal budgets without the headache.</Text>

                    <View style={[styles.grid, isDesktop ? styles.gridDesktop : styles.gridMobile]}>
                        {features.map((feature, index) => (
                            <View key={index} style={styles.gridCard}>
                                <View style={styles.iconBox}>
                                    <Ionicons name={feature.icon as any} size={24} color="#06B6D4" />
                                </View>
                                <Text style={styles.cardTitle}>{feature.title}</Text>
                                <Text style={styles.cardDesc}>{feature.desc}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>© 2026 Splitora. Built with ❤️.</Text>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A', // Slate 900
    },
    scrollContent: {
        flexGrow: 1,
    },
    navbar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingVertical: 20,
    },
    navbarDesktop: {
        paddingHorizontal: 48,
        maxWidth: 1200,
        width: '100%',
        alignSelf: 'center',
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoIcon: {
        width: 32,
        height: 32,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    logoText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 18,
    },
    brandName: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    navLinks: {
        flexDirection: 'row',
        gap: 32,
    },
    navLink: {
        color: '#94A3B8', // Slate 400
        fontSize: 15,
        fontWeight: '500',
    },
    authButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    loginText: {
        color: 'white',
        fontSize: 15,
        fontWeight: '600',
    },
    getStartedBtn: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
    },
    getStartedText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    },

    // Hero
    heroSection: {
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 64,
    },
    badgeContainer: {
        marginBottom: 24,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(6, 182, 212, 0.3)',
    },
    badgeDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#06B6D4',
        marginRight: 8,
    },
    badgeText: {
        color: '#06B6D4',
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    heroTitle: {
        fontSize: 42,
        fontWeight: '800',
        color: 'white',
        textAlign: 'center',
        lineHeight: 52,
        marginBottom: 24,
    },
    heroTitleHighlight: {
        color: '#818CF8', // Indigo 400
    },
    heroSubtitle: {
        fontSize: 18,
        color: '#94A3B8',
        textAlign: 'center',
        maxWidth: 600,
        lineHeight: 28,
        marginBottom: 40,
    },
    heroButtons: {
        flexDirection: 'row',
        gap: 16,
    },
    primaryHeroBtn: {
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 30,
    },
    primaryHeroBtnText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    secondaryHeroBtn: {
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 30,
        backgroundColor: 'rgba(30, 41, 59, 0.5)', // Slate 800
        borderWidth: 1,
        borderColor: '#334155',
    },
    secondaryHeroBtnText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },

    // Features
    featuresSection: {
        paddingVertical: 64,
        paddingHorizontal: 24,
        backgroundColor: '#0F172A',
    },
    sectionTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
        marginBottom: 16,
    },
    sectionSubtitle: {
        fontSize: 16,
        color: '#94A3B8',
        textAlign: 'center',
        marginBottom: 64,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 24,
        justifyContent: 'center',
    },
    gridDesktop: {
        maxWidth: 1200,
        alignSelf: 'center',
    },
    gridMobile: {},
    gridCard: {
        backgroundColor: '#1E293B', // Slate 800
        borderRadius: 16,
        padding: 24,
        width: 340,
        minHeight: 200,
        borderWidth: 1,
        borderColor: '#334155',
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: 'rgba(6, 182, 212, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 12,
    },
    cardDesc: {
        fontSize: 15,
        color: '#94A3B8',
        lineHeight: 24,
    },

    // Footer
    footer: {
        padding: 40,
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#334155',
    },
    footerText: {
        color: '#64748B',
    }
});
