import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Dimensions,
  Alert,
  Animated,
} from 'react-native';
import { useState, useMemo, useRef } from 'react';
import { useRouter } from 'expo-router';
import { useAppTheme, type AppColors } from '../../src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface Flashcard {
  id: string;
  term: string;
  definition: string;
}

interface FlashcardDeck {
  id: string;
  title: string;
  subject: string;
  cards: Flashcard[];
  color: string;
  lastStudied?: string;
}

const deckColors = [
  '#4F46E5',
  '#10B981',
  '#F59E0B',
  '#EC4899',
  '#06B6D4',
  '#8B5CF6',
];

export default function FlashcardsScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [decks, setDecks] = useState<FlashcardDeck[]>([
    {
      id: '1',
      title: 'Mathematics Formulas',
      subject: 'Math',
      color: '#4F46E5',
      cards: [
        {
          id: '1',
          term: 'Quadratic Formula',
          definition: 'x = (-b ± √(b²-4ac)) / 2a',
        },
        { id: '2', term: 'Pythagorean Theorem', definition: 'a² + b² = c²' },
        { id: '3', term: 'Area of Circle', definition: 'πr²' },
      ],
      lastStudied: '2 hours ago',
    },
    {
      id: '2',
      title: 'Chemistry Periodic Table',
      subject: 'Chemistry',
      color: '#10B981',
      cards: [
        { id: '1', term: 'Hydrogen', definition: 'H - Atomic #: 1' },
        { id: '2', term: 'Helium', definition: 'He - Atomic #: 2' },
        { id: '3', term: 'Carbon', definition: 'C - Atomic #: 6' },
      ],
      lastStudied: 'Yesterday',
    },
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [showStudyMode, setShowStudyMode] = useState(false);
  const [selectedDeck, setSelectedDeck] = useState<FlashcardDeck | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [newDeckTitle, setNewDeckTitle] = useState('');
  const [newDeckSubject, setNewDeckSubject] = useState('');
  const [newCardTerm, setNewCardTerm] = useState('');
  const [newCardDefinition, setNewCardDefinition] = useState('');
  const [deckToAddCards, setDeckToAddCards] = useState<FlashcardDeck | null>(
    null,
  );

  const flipAnim = useRef(new Animated.Value(0)).current;

  const flipCard = () => {
    Animated.spring(flipAnim, {
      toValue: isFlipped ? 0 : 1,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
    setIsFlipped(!isFlipped);
  };

  const handleCreateDeck = () => {
    if (!newDeckTitle.trim() || !newDeckSubject.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const newDeck: FlashcardDeck = {
      id: Date.now().toString(),
      title: newDeckTitle,
      subject: newDeckSubject,
      color: deckColors[decks.length % deckColors.length],
      cards: [],
    };

    setDecks([...decks, newDeck]);
    setNewDeckTitle('');
    setNewDeckSubject('');
    setShowCreateModal(false);

    // Open add card modal for the new deck
    setDeckToAddCards(newDeck);
    setShowAddCardModal(true);
  };

  const handleAddCard = () => {
    if (!newCardTerm.trim() || !newCardDefinition.trim()) {
      Alert.alert('Error', 'Please fill in both term and definition');
      return;
    }

    if (!deckToAddCards) return;

    const newCard: Flashcard = {
      id: Date.now().toString(),
      term: newCardTerm,
      definition: newCardDefinition,
    };

    const updatedDecks = decks.map((deck) => {
      if (deck.id === deckToAddCards.id) {
        return { ...deck, cards: [...deck.cards, newCard] };
      }
      return deck;
    });

    setDecks(updatedDecks);
    setNewCardTerm('');
    setNewCardDefinition('');

    // Ask if user wants to add more cards
    Alert.alert('Card Added', 'Would you like to add another card?', [
      {
        text: 'Done',
        style: 'cancel',
        onPress: () => {
          setShowAddCardModal(false);
          setDeckToAddCards(null);
        },
      },
      { text: 'Add More', onPress: () => {} },
    ]);
  };

  const handleAddCardsToDeck = (deck: FlashcardDeck) => {
    setDeckToAddCards(deck);
    setShowAddCardModal(true);
  };

  const handleStartStudy = (deck: FlashcardDeck) => {
    if (!deck.cards || deck.cards.length === 0) {
      Alert.alert(
        'No Cards',
        'This deck has no cards. Add cards to start studying.',
      );
      return;
    }
    setSelectedDeck(deck);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    flipAnim.setValue(0);
    setShowStudyMode(true);
  };

  const handleNextCard = () => {
    if (selectedDeck && currentCardIndex < selectedDeck.cards.length - 1) {
      setIsFlipped(false);
      flipAnim.setValue(0);
      setCurrentCardIndex(currentCardIndex + 1);
    }
  };

  const handlePrevCard = () => {
    if (currentCardIndex > 0) {
      setIsFlipped(false);
      flipAnim.setValue(0);
      setCurrentCardIndex(currentCardIndex - 1);
    }
  };

  const handleDeleteDeck = (deckId: string) => {
    Alert.alert('Delete Deck', 'Are you sure you want to delete this deck?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => setDecks(decks.filter((d) => d.id !== deckId)),
      },
    ]);
  };

  // Study Mode Screen
  if (showStudyMode && selectedDeck) {
    const currentCard = selectedDeck.cards[currentCardIndex];
    const progress = ((currentCardIndex + 1) / selectedDeck.cards.length) * 100;

    return (
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.studyHeader}>
          <TouchableOpacity
            onPress={() => setShowStudyMode(false)}
            style={styles.backButton}
          >
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.studyTitle}>{selectedDeck.title}</Text>
          <Text style={styles.studyProgress}>
            {currentCardIndex + 1} / {selectedDeck.cards.length}
          </Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarBg}>
          <Animated.View
            style={[styles.progressBarFill, { width: `${progress}%` }]}
          />
        </View>

        {/* Flashcard */}
        <View style={styles.cardContainer}>
          <TouchableOpacity
            style={styles.flashcard}
            onPress={flipCard}
            activeOpacity={0.9}
          >
            <Animated.View
              style={[
                styles.flashcardInner,
                {
                  transform: [
                    {
                      rotateY: flipAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '180deg'],
                      }),
                    },
                  ],
                },
              ]}
            >
              {!isFlipped ? (
                <View style={styles.cardFront}>
                  <Text style={styles.cardLabel}>TERM</Text>
                  <Text style={styles.cardTerm}>{currentCard.term}</Text>
                  <Text style={styles.tapHint}>Tap to flip</Text>
                </View>
              ) : (
                <View style={styles.cardBack}>
                  <Text style={styles.cardLabel}>DEFINITION</Text>
                  <Text style={styles.cardDefinition}>
                    {currentCard.definition}
                  </Text>
                  <Text style={styles.tapHint}>Tap to flip back</Text>
                </View>
              )}
            </Animated.View>
          </TouchableOpacity>
        </View>

        {/* Navigation */}
        <View style={styles.navButtons}>
          <TouchableOpacity
            style={[
              styles.navButton,
              currentCardIndex === 0 && styles.navButtonDisabled,
            ]}
            onPress={handlePrevCard}
            disabled={currentCardIndex === 0}
          >
            <Ionicons
              name="chevron-back"
              size={24}
              color={currentCardIndex === 0 ? '#9CA3AF' : colors.text}
            />
            <Text
              style={[
                styles.navButtonText,
                currentCardIndex === 0 && styles.navButtonTextDisabled,
              ]}
            >
              Previous
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.navButton,
              currentCardIndex === selectedDeck.cards.length - 1 &&
                styles.navButtonDisabled,
            ]}
            onPress={handleNextCard}
            disabled={currentCardIndex === selectedDeck.cards.length - 1}
          >
            <Text
              style={[
                styles.navButtonText,
                currentCardIndex === selectedDeck.cards.length - 1 &&
                  styles.navButtonTextDisabled,
              ]}
            >
              Next
            </Text>
            <Ionicons
              name="chevron-forward"
              size={24}
              color={
                currentCardIndex === selectedDeck.cards.length - 1
                  ? '#9CA3AF'
                  : colors.text
              }
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Flashcards</Text>
          <Text style={styles.subtitle}>Create and study with flashcards</Text>
        </View>

        {/* Decks Grid */}
        <View style={styles.decksGrid}>
          {decks.map((deck) => (
            <TouchableOpacity
              key={deck.id}
              style={[styles.deckCard, { borderLeftColor: deck.color }]}
              onPress={() => handleStartStudy(deck)}
              onLongPress={() => handleDeleteDeck(deck.id)}
              activeOpacity={0.7}
            >
              <View style={[styles.deckIcon, { backgroundColor: deck.color }]}>
                <Ionicons name="albums" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.deckTitle}>{deck.title}</Text>
              <Text style={styles.deckSubject}>{deck.subject}</Text>
              <Text style={styles.deckCards}>
                {deck.cards.length} card{deck.cards.length !== 1 ? 's' : ''}
              </Text>
              {deck.lastStudied && (
                <Text style={styles.deckLastStudied}>
                  Last studied: {deck.lastStudied}
                </Text>
              )}
              <TouchableOpacity
                style={styles.addCardButton}
                onPress={() => handleAddCardsToDeck(deck)}
              >
                <Ionicons name="add" size={16} color={colors.primary} />
                <Text style={styles.addCardText}>Add Cards</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}

          {/* Create New Deck Card */}
          <TouchableOpacity
            style={styles.createCard}
            onPress={() => setShowCreateModal(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="add-circle" size={32} color={colors.primary} />
            <Text style={styles.createText}>Create New Deck</Text>
          </TouchableOpacity>
        </View>

        {/* Empty State */}
        {decks.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="albums-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No Flashcards Yet</Text>
            <Text style={styles.emptySubtitle}>
              Create your first flashcard deck to start studying
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => setShowCreateModal(true)}
            >
              <Text style={styles.emptyButtonText}>Create Deck</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Create Deck Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Deck</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Deck Title"
              placeholderTextColor="#9CA3AF"
              value={newDeckTitle}
              onChangeText={setNewDeckTitle}
            />

            <TextInput
              style={styles.input}
              placeholder="Subject (e.g., Math, Science)"
              placeholderTextColor="#9CA3AF"
              value={newDeckSubject}
              onChangeText={setNewDeckSubject}
            />

            <TouchableOpacity
              style={styles.createButton}
              onPress={handleCreateDeck}
            >
              <Text style={styles.createButtonText}>Create Deck</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add Card Modal */}
      <Modal
        visible={showAddCardModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddCardModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Add Card to {deckToAddCards?.title}
              </Text>
              <TouchableOpacity onPress={() => setShowAddCardModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Term (front of card)"
              placeholderTextColor="#9CA3AF"
              value={newCardTerm}
              onChangeText={setNewCardTerm}
            />

            <TextInput
              style={[styles.input, styles.definitionInput]}
              placeholder="Definition (back of card)"
              placeholderTextColor="#9CA3AF"
              value={newCardDefinition}
              onChangeText={setNewCardDefinition}
              multiline
              numberOfLines={3}
            />

            <TouchableOpacity
              style={styles.createButton}
              onPress={handleAddCard}
            >
              <Text style={styles.createButtonText}>Add Card</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const makeStyles = (c: AppColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.background,
    },
    scrollView: {
      flex: 1,
    },
    header: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 24,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: c.text,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 16,
      color: c.textSecondary,
    },
    decksGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: 16,
      gap: 12,
    },
    deckCard: {
      width: width / 2 - 22,
      backgroundColor: c.surface,
      borderRadius: 16,
      padding: 16,
      borderLeftWidth: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    deckIcon: {
      width: 40,
      height: 40,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
    },
    deckTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: c.text,
      marginBottom: 4,
    },
    deckSubject: {
      fontSize: 13,
      color: c.textSecondary,
      marginBottom: 8,
    },
    deckCards: {
      fontSize: 12,
      color: c.textSecondary,
    },
    deckLastStudied: {
      fontSize: 11,
      color: '#9CA3AF',
      marginTop: 4,
    },
    createCard: {
      width: width / 2 - 22,
      backgroundColor: c.surface,
      borderRadius: 16,
      padding: 16,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderStyle: 'dashed',
      borderColor: c.primary,
      minHeight: 150,
    },
    createText: {
      fontSize: 14,
      fontWeight: '600',
      color: c.primary,
      marginTop: 8,
    },
    emptyState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 60,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: c.text,
      marginTop: 16,
      marginBottom: 8,
    },
    emptySubtitle: {
      fontSize: 14,
      color: c.textSecondary,
      textAlign: 'center',
      paddingHorizontal: 32,
    },
    emptyButton: {
      backgroundColor: c.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 12,
      marginTop: 20,
    },
    emptyButtonText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '600',
    },
    // Modal styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: c.surface,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 24,
      paddingBottom: 40,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 24,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: c.text,
    },
    input: {
      backgroundColor: c.background,
      borderRadius: 12,
      padding: 16,
      fontSize: 15,
      color: c.text,
      marginBottom: 16,
    },
    definitionInput: {
      height: 100,
      textAlignVertical: 'top',
    },
    addCardButton: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
      paddingVertical: 6,
      paddingHorizontal: 10,
      backgroundColor: c.primaryLight,
      borderRadius: 8,
    },
    addCardText: {
      fontSize: 12,
      fontWeight: '600',
      color: c.primary,
      marginLeft: 4,
    },
    createButton: {
      backgroundColor: c.primary,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 8,
    },
    createButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    // Study mode styles
    studyHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 12,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: c.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    studyTitle: {
      fontSize: 17,
      fontWeight: '600',
      color: c.text,
    },
    studyProgress: {
      fontSize: 14,
      color: c.textSecondary,
    },
    progressBarBg: {
      height: 4,
      backgroundColor: c.surface,
      marginHorizontal: 16,
      borderRadius: 2,
      marginBottom: 24,
    },
    progressBarFill: {
      height: '100%',
      backgroundColor: c.primary,
      borderRadius: 2,
    },
    cardContainer: {
      flex: 1,
      paddingHorizontal: 24,
      justifyContent: 'center',
    },
    flashcard: {
      height: 280,
      backgroundColor: c.surface,
      borderRadius: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 4,
    },
    flashcardInner: {
      flex: 1,
      backfaceVisibility: 'hidden',
    },
    cardFront: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    },
    cardBack: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      backgroundColor: c.primary,
      borderRadius: 20,
    },
    cardLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: '#9CA3AF',
      marginBottom: 12,
      letterSpacing: 1,
    },
    cardTerm: {
      fontSize: 22,
      fontWeight: '600',
      color: c.text,
      textAlign: 'center',
    },
    cardDefinition: {
      fontSize: 18,
      fontWeight: '500',
      color: '#FFFFFF',
      textAlign: 'center',
    },
    tapHint: {
      position: 'absolute',
      bottom: 20,
      fontSize: 12,
      color: '#9CA3AF',
    },
    navButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 24,
      paddingVertical: 24,
    },
    navButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: c.surface,
      borderRadius: 12,
    },
    navButtonDisabled: {
      opacity: 0.5,
    },
    navButtonText: {
      fontSize: 15,
      fontWeight: '600',
      color: c.text,
    },
    navButtonTextDisabled: {
      color: '#9CA3AF',
    },
  });
