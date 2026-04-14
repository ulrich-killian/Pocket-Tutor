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
  ActivityIndicator,
  Easing,
  TouchableWithoutFeedback,
} from 'react-native';
import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useAppTheme, type AppColors } from '../../src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import {
  generateFlashcards,
  getFlashcardsByDocument,
  getAllUserFlashcards,
} from '../../src/services/flashcard.service';
import { documentService } from '../../src/services/document.service';
import type { Flashcard, FlashcardDeck } from '../../src/types/flashcard.type';
import type { Document } from '../../src/types/document';
import type { Document as DocType } from '../../src/types/document';
import { useAuth } from '../../src/context/AuthContext';

const { width } = Dimensions.get('window');

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
  const c = colors;
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { user } = useAuth();

  const [decks, setDecks] = useState<FlashcardDeck[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [showStudyMode, setShowStudyMode] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
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

  // Load flashcards and documents on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        if (!user?.id) {
          setDecks([]);
          return;
        }

        // Load documents and flashcards in parallel
        const [docs, flashcards] = await Promise.all([
          documentService.getUserDocuments(user.id),
          getAllUserFlashcards(user.id),
        ]);

        setDocuments(docs);

        // Create a map of documentId -> document title
        const docTitleMap = docs.reduce(
          (acc, doc) => {
            acc[doc.id] = doc.title;
            return acc;
          },
          {} as Record<string, string>,
        );

        // Group flashcards by document_id into decks
        const grouped = flashcards.reduce(
          (acc, card) => {
            const docId = card.document_id || 'local';
            if (!acc[docId]) {
              // Use document title if available, otherwise use default
              const title = docTitleMap[docId]
                ? `${docTitleMap[docId]} Flashcards`
                : 'Custom Flashcards';

              acc[docId] = {
                id: docId,
                title: title,
                subject: docTitleMap[docId] ? 'From Document' : 'Custom',
                color: deckColors[Object.keys(acc).length % deckColors.length],
                cards: [],
                documentId: docId,
                userId: user.id,
              };
            }
            acc[docId].cards.push(card);
            return acc;
          },
          {} as Record<string, FlashcardDeck>,
        );

        console.log('Grouped decks:', Object.keys(grouped));
        setDecks(Object.values(grouped));
      } catch (error) {
        console.error('Error loading flashcards:', error);
        setDecks([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user?.id]);

  const handleGenerateFromDocument = async (documentId: string) => {
    if (!user?.id) return;

    try {
      setIsGenerating(true);
      const newCards = await generateFlashcards({
        documentId,
        userId: user.id,
      });

      // Ensure cards have both document_id for proper grouping
      const normalizedCards = newCards.map((card) => ({
        ...card,
        document_id: documentId,
      }));

      // Get document title for deck name
      const doc = documents.find((d) => d.id === documentId);
      const deckTitle = doc
        ? `${doc.title} Flashcards`
        : 'Generated Flashcards';

      // Add new cards to the deck
      setDecks((prevDecks) => {
        const existingDeck = prevDecks.find((d) => d.documentId === documentId);
        if (existingDeck) {
          return prevDecks.map((d) =>
            d.documentId === documentId
              ? { ...d, cards: [...d.cards, ...normalizedCards] }
              : d,
          );
        }
        // Create new deck
        const newDeck: FlashcardDeck = {
          id: documentId,
          title: deckTitle,
          subject: 'From Document',
          color: deckColors[prevDecks.length % deckColors.length],
          cards: normalizedCards,
          documentId,
          userId: user.id,
        };
        return [...prevDecks, newDeck];
      });

      setShowGenerateModal(false);
      Alert.alert('Success', `Generated ${newCards.length} flashcards!`);
    } catch (error) {
      console.error('Error generating flashcards:', error);
      Alert.alert('Error', 'Failed to generate flashcards. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const flipAnim = useRef(new Animated.Value(0)).current;

  const flipCard = () => {
    const toValue = isFlipped ? 0 : 1;
    Animated.timing(flipAnim, {
      toValue,
      duration: 500,
      easing: Easing.inOut(Easing.ease),
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
      front: newCardTerm,
      back: newCardDefinition,
      document_id: deckToAddCards.documentId || '',
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

  const getCardHeight = (frontText: string, backText: string) => {
    const maxLength = Math.max(frontText.length, backText.length);
    const baseHeight = 340;
    if (maxLength > 200) return baseHeight + 120;
    if (maxLength > 100) return baseHeight + 60;
    if (maxLength > 50) return baseHeight + 30;
    return baseHeight;
  };

  // Study Mode Screen
  if (showStudyMode && selectedDeck) {
    const currentCard = selectedDeck.cards[currentCardIndex];
    const progress = ((currentCardIndex + 1) / selectedDeck.cards.length) * 100;
    const cardHeight = getCardHeight(currentCard.front, currentCard.back);

    return (
      <View style={[styles.container, { paddingTop: 20 }]}>
        {/* Header */}
        <View style={styles.studyHeader}>
          <TouchableOpacity
            onPress={() => setShowStudyMode(false)}
            style={styles.backButton}
          >
            <MaterialCommunityIcons
              name="close"
              size={22}
              color={colors.text}
            />
          </TouchableOpacity>
          <Text style={styles.studyTitle} numberOfLines={1}>
            {selectedDeck.title}
          </Text>
          <View style={styles.progressBadge}>
            <Text style={styles.studyProgress}>
              {currentCardIndex + 1} / {selectedDeck.cards.length}
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarBg}>
          <Animated.View
            style={[styles.progressBarFill, { width: `${progress}%` }]}
          />
        </View>

        {/* Flashcard */}
        <View style={[styles.cardContainer, { minHeight: cardHeight }]}>
          <TouchableOpacity
            style={[styles.flashcard, { height: cardHeight }]}
            onPress={flipCard}
            activeOpacity={0.95}
          >
            {/* Front Card */}
            <Animated.View
              style={[
                styles.flashcardInner,
                styles.cardFrontInner,
                {
                  opacity: flipAnim.interpolate({
                    inputRange: [0, 0.5, 0.5, 1],
                    outputRange: [1, 1, 0, 0],
                  }),
                  transform: [
                    {
                      scale: flipAnim.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [1, 1, 0.9],
                      }),
                    },
                  ],
                },
              ]}
            >
              <View style={styles.cardContentWrapper}>
                {/* Header with Label */}
                <View style={styles.cardHeaderSection}>
                  <View style={styles.labelContainer}>
                    <MaterialCommunityIcons
                      name="lightbulb-outline"
                      size={14}
                      color={colors.primary}
                    />
                    <Text style={styles.cardLabel}>TERM</Text>
                  </View>
                </View>

                {/* Main Content - Centered */}
                <View style={styles.cardMainContent}>
                  <ScrollView
                    style={styles.cardScrollContent}
                    contentContainerStyle={styles.cardScrollContentContainer}
                    showsVerticalScrollIndicator={false}
                    centerContent={true}
                  >
                    <Text style={styles.cardTerm}>{currentCard.front}</Text>
                  </ScrollView>
                </View>

                {/* Footer with Tap Hint */}
                <View style={styles.cardFooterSection}>
                  <View style={styles.tapHintContainer}>
                    <MaterialCommunityIcons
                      name="hand-pointing-up"
                      size={12}
                      color={colors.textSecondary}
                    />
                    <Text style={styles.tapHint}>Tap to flip</Text>
                  </View>
                </View>
              </View>
            </Animated.View>

            {/* Back Card */}
            <Animated.View
              style={[
                styles.flashcardInner,
                styles.cardBackInner,
                {
                  opacity: flipAnim.interpolate({
                    inputRange: [0, 0.5, 0.5, 1],
                    outputRange: [0, 0, 1, 1],
                  }),
                  transform: [
                    {
                      scale: flipAnim.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0.9, 1, 1],
                      }),
                    },
                  ],
                },
              ]}
            >
              <View style={styles.cardContentWrapper}>
                {/* Header with Label */}
                <View style={styles.cardHeaderSection}>
                  <View
                    style={[styles.labelContainer, styles.labelContainerBack]}
                  >
                    <MaterialCommunityIcons
                      name="book-open-variant"
                      size={14}
                      color="#FFFFFF"
                    />
                    <Text style={[styles.cardLabel, styles.cardLabelBack]}>
                      DEFINITION
                    </Text>
                  </View>
                </View>

                {/* Main Content - Centered */}
                <View style={styles.cardMainContent}>
                  <ScrollView
                    style={styles.cardScrollContent}
                    contentContainerStyle={styles.cardScrollContentContainer}
                    showsVerticalScrollIndicator={false}
                    centerContent={true}
                  >
                    <Text style={styles.cardDefinition}>
                      {currentCard.back}
                    </Text>
                  </ScrollView>
                </View>

                {/* Footer with Tap Hint */}
                <View style={styles.cardFooterSection}>
                  <View style={styles.tapHintContainerBack}>
                    <MaterialCommunityIcons
                      name="gesture-tap"
                      size={12}
                      color="rgba(255,255,255,0.6)"
                    />
                    <Text style={styles.tapHintBack}>Tap to flip back</Text>
                  </View>
                </View>
              </View>
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
        contentContainerStyle={
          decks.length === 0 && !isLoading ? styles.scrollViewEmpty : undefined
        }
      >
        {/* Enhanced Header with Stats */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.title}>Flashcards</Text>
              <Text style={styles.subtitle}>Master your studies</Text>
            </View>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{decks.length}</Text>
                <Text style={styles.statLabel}>Decks</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {decks.reduce((sum, d) => sum + d.cards.length, 0)}
                </Text>
                <Text style={styles.statLabel}>Cards</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Decks List */}
        <ScrollView
          style={styles.decksListContainer}
          contentContainerStyle={styles.decksListContent}
          showsVerticalScrollIndicator={false}
        >
          {decks.map((deck) => (
            <TouchableOpacity
              key={deck.id}
              style={styles.deckListCard}
              onPress={() => handleStartStudy(deck)}
              onLongPress={() => handleDeleteDeck(deck.id)}
              activeOpacity={0.7}
            >
              {/* Color Indicator Bar */}
              <View
                style={[styles.deckColorBar, { backgroundColor: deck.color }]}
              />

              {/* Deck Content */}
              <View style={styles.deckListContent}>
                {/* Icon */}
                <View
                  style={[
                    styles.deckIconContainer,
                    { backgroundColor: deck.color + '20' },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="cards"
                    size={24}
                    color={deck.color}
                  />
                </View>

                {/* Info */}
                <View style={styles.deckInfo}>
                  <Text style={styles.deckListTitle} numberOfLines={1}>
                    {deck.title}
                  </Text>
                  <Text style={styles.deckListSubject} numberOfLines={1}>
                    {deck.subject}
                  </Text>
                  <View style={styles.deckMetaRow}>
                    <MaterialCommunityIcons
                      name="layers"
                      size={12}
                      color={c.textSecondary}
                    />
                    <Text style={styles.deckMetaText}>
                      {deck.cards.length} cards
                    </Text>
                  </View>
                </View>

                {/* Study Button */}
                <TouchableOpacity
                  style={[
                    styles.studyListButton,
                    { backgroundColor: deck.color },
                  ]}
                  onPress={() => handleStartStudy(deck)}
                >
                  <MaterialCommunityIcons
                    name="play"
                    size={16}
                    color="#FFFFFF"
                  />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}

          {/* Generate from Document Button */}
          {documents.length > 0 && (
            <TouchableOpacity
              style={styles.generateListCard}
              onPress={() => setShowGenerateModal(true)}
              activeOpacity={0.7}
            >
              <View style={styles.generateListIcon}>
                <MaterialCommunityIcons
                  name="robot"
                  size={24}
                  color={colors.primary}
                />
              </View>
              <View style={styles.generateListInfo}>
                <Text style={styles.generateListTitle}>
                  Generate from Document
                </Text>
                <Text style={styles.generateListSubtext}>
                  Create flashcards using AI from your documents
                </Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color={colors.primary}
              />
            </TouchableOpacity>
          )}

          {/* Create New Deck */}
          <TouchableOpacity
            style={styles.createListCard}
            onPress={() => setShowCreateModal(true)}
            activeOpacity={0.7}
          >
            <View style={styles.createListIcon}>
              <MaterialCommunityIcons
                name="plus"
                size={24}
                color={colors.primary}
              />
            </View>
            <View style={styles.createListInfo}>
              <Text style={styles.createListTitle}>Create New Deck</Text>
              <Text style={styles.createListSubtext}>
                Manually add your own flashcards
              </Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color={colors.primary}
            />
          </TouchableOpacity>
        </ScrollView>

        {/* Loading State */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading your flashcards...</Text>
          </View>
        )}

        {/* Empty State */}
        {!isLoading && decks.length === 0 && (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <MaterialCommunityIcons
                name="cards-outline"
                size={64}
                color={colors.primary}
              />
            </View>
            <Text style={styles.emptyTitle}>No Flashcards Yet</Text>
            <Text style={styles.emptySubtitle}>
              Create your first flashcard deck or generate one from your
              documents
            </Text>
            <View style={styles.emptyActions}>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => setShowCreateModal(true)}
              >
                <MaterialCommunityIcons name="plus" size={20} color="#FFFFFF" />
                <Text style={styles.emptyButtonText}>Create Deck</Text>
              </TouchableOpacity>
              {documents.length > 0 && (
                <TouchableOpacity
                  style={[styles.emptyButton, styles.emptyButtonSecondary]}
                  onPress={() => setShowGenerateModal(true)}
                >
                  <MaterialCommunityIcons
                    name="robot"
                    size={20}
                    color={colors.primary}
                  />
                  <Text
                    style={[
                      styles.emptyButtonText,
                      styles.emptyButtonTextSecondary,
                    ]}
                  >
                    Generate AI
                  </Text>
                </TouchableOpacity>
              )}
            </View>
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
                <MaterialCommunityIcons
                  name="close"
                  size={24}
                  color={colors.text}
                />
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
                <MaterialCommunityIcons
                  name="close"
                  size={24}
                  color={colors.text}
                />
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

      {/* Generate from Document Modal */}
      <Modal
        visible={showGenerateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => !isGenerating && setShowGenerateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Generate Flashcards</Text>
              {!isGenerating && (
                <TouchableOpacity onPress={() => setShowGenerateModal(false)}>
                  <MaterialCommunityIcons
                    name="close"
                    size={24}
                    color={colors.text}
                  />
                </TouchableOpacity>
              )}
            </View>

            {isGenerating ? (
              <View style={styles.generatingFullContainer}>
                <View style={styles.generatingContent}>
                  <View style={styles.generatingIconCircle}>
                    <MaterialCommunityIcons
                      name="brain"
                      size={44}
                      color={colors.primary}
                    />
                  </View>
                  <Text style={styles.generatingTitle}>
                    Generating Flashcards
                  </Text>
                  <Text style={styles.generatingSubtitle}>
                    AI is analyzing your document{'\n'}and creating
                    flashcards...
                  </Text>
                  <View style={styles.generatingLoaderContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                  </View>
                </View>
              </View>
            ) : (
              <>
                <View style={styles.modalInfoBox}>
                  <MaterialCommunityIcons
                    name="information"
                    size={20}
                    color={colors.primary}
                  />
                  <Text style={styles.modalInfoText}>
                    Select a document to generate flashcards using AI
                  </Text>
                </View>

                <ScrollView style={styles.documentList}>
                  {documents.map((doc) => (
                    <TouchableOpacity
                      key={doc.id}
                      style={styles.documentItem}
                      onPress={async () => {
                        await handleGenerateFromDocument(doc.id);
                      }}
                    >
                      <View style={styles.documentIconContainer}>
                        <MaterialCommunityIcons
                          name="file-document-outline"
                          size={22}
                          color={colors.primary}
                        />
                      </View>
                      <View style={styles.documentInfo}>
                        <Text style={styles.documentTitle} numberOfLines={2}>
                          {doc.title}
                        </Text>
                        <Text style={styles.documentMeta}>
                          Tap to generate flashcards
                        </Text>
                      </View>
                      <MaterialCommunityIcons
                        name="chevron-right"
                        size={24}
                        color={colors.primary}
                      />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}
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
    scrollViewEmpty: {
      flexGrow: 1,
    },
    header: {
      paddingHorizontal: 16,
      paddingTop: 8,
      paddingBottom: 16,
    },
    headerTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    statsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.surface,
      borderRadius: 16,
      paddingVertical: 12,
      paddingHorizontal: 20,
    },
    statItem: {
      alignItems: 'center',
      paddingHorizontal: 12,
    },
    statNumber: {
      fontSize: 24,
      fontWeight: '700',
      color: c.text,
    },
    statLabel: {
      fontSize: 12,
      color: c.textSecondary,
      marginTop: 2,
    },
    statDivider: {
      width: 1,
      height: 30,
      backgroundColor: c.border,
    },
    quickActions: {
      flexDirection: 'row',
      gap: 12,
    },
    quickActionButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.surface,
      borderRadius: 12,
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderWidth: 1,
      borderColor: c.border,
    },
    quickActionPrimary: {
      backgroundColor: c.primary,
      borderColor: c.primary,
    },
    quickActionText: {
      fontSize: 14,
      fontWeight: '600',
      color: c.text,
      marginLeft: 8,
    },
    quickActionTextPrimary: {
      color: '#FFFFFF',
    },
    title: {
      marginTop: 8,
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
    // New List Layout Styles
    decksListContainer: {
      flex: 1,
    },
    decksListContent: {
      paddingHorizontal: 16,
      paddingBottom: 24,
      gap: 12,
    },
    deckListCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.surface,
      borderRadius: 16,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    deckColorBar: {
      width: 4,
      alignSelf: 'stretch',
    },
    deckListContent: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      padding: 14,
    },
    deckIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 14,
    },
    deckInfo: {
      flex: 1,
    },
    deckListTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: c.text,
      marginBottom: 2,
    },
    deckListSubject: {
      fontSize: 13,
      color: c.textSecondary,
      marginBottom: 4,
    },
    deckMetaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    deckMetaText: {
      fontSize: 12,
      color: c.textSecondary,
    },
    studyListButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    generateListCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.primaryLight + '30',
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: c.primary,
      borderStyle: 'dashed',
    },
    generateListIcon: {
      width: 48,
      height: 48,
      borderRadius: 12,
      backgroundColor: c.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 14,
    },
    generateListInfo: {
      flex: 1,
    },
    generateListTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: c.primary,
      marginBottom: 2,
    },
    generateListSubtext: {
      fontSize: 13,
      color: c.textSecondary,
    },
    createListCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.surface,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: c.border,
      borderStyle: 'dashed',
    },
    createListIcon: {
      width: 48,
      height: 48,
      borderRadius: 12,
      backgroundColor: c.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 14,
    },
    createListInfo: {
      flex: 1,
    },
    createListTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: c.text,
      marginBottom: 2,
    },
    createListSubtext: {
      fontSize: 13,
      color: c.textSecondary,
    },
    deckCard: {
      width: width / 2 - 22,
      backgroundColor: c.surface,
      borderRadius: 16,
      overflow: 'hidden',
      borderLeftWidth: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
      marginBottom: 4,
    },
    deckCardHeader: {
      height: 70,
      alignItems: 'center',
      justifyContent: 'center',
    },
    deckCardContent: {
      padding: 12,
    },
    cardCountBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.primaryLight,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      alignSelf: 'flex-start',
      marginTop: 8,
      marginBottom: 12,
    },
    cardCountText: {
      fontSize: 12,
      fontWeight: '600',
      color: c.primary,
      marginLeft: 4,
    },
    deckActions: {
      flexDirection: 'row',
      gap: 8,
    },
    studyButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.primary,
      paddingVertical: 8,
      borderRadius: 8,
      gap: 6,
    },
    studyButtonText: {
      fontSize: 13,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    addCardButtonSmall: {
      width: 36,
      height: 36,
      borderRadius: 8,
      backgroundColor: c.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
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
    generateCard: {
      width: width / 2 - 22,
      backgroundColor: c.surface,
      borderRadius: 16,
      padding: 16,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 180,
      borderWidth: 2,
      borderStyle: 'dashed',
      borderColor: c.primary,
    },
    generateCardIcon: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: c.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
    },
    generateText: {
      fontSize: 14,
      fontWeight: '600',
      color: c.text,
      marginTop: 8,
      textAlign: 'center',
    },
    generateSubtext: {
      fontSize: 11,
      color: c.textSecondary,
      textAlign: 'center',
      marginTop: 4,
      paddingHorizontal: 8,
    },
    modalSubtitle: {
      fontSize: 14,
      color: c.textSecondary,
      marginBottom: 16,
    },
    modalInfoBox: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.primaryLight,
      padding: 12,
      borderRadius: 12,
      marginBottom: 16,
    },
    modalInfoText: {
      flex: 1,
      fontSize: 13,
      color: c.text,
      marginLeft: 8,
    },
    documentList: {
      maxHeight: 300,
    },
    documentItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.background,
      borderRadius: 12,
      padding: 16,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: c.border,
    },
    documentIconContainer: {
      width: 44,
      height: 44,
      borderRadius: 10,
      backgroundColor: c.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    documentTitle: {
      flex: 1,
      fontSize: 14,
      fontWeight: '600',
      color: c.text,
    },
    documentInfo: {
      flex: 1,
      marginLeft: 12,
    },
    documentMeta: {
      fontSize: 12,
      color: c.textSecondary,
      marginTop: 2,
    },
    loadingContainer: {
      alignItems: 'center',
      padding: 20,
    },
    loadingText: {
      fontSize: 14,
      color: c.textSecondary,
      marginTop: 8,
    },
    generatingFullContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    generatingContent: {
      alignItems: 'center',
      paddingHorizontal: 24,
    },
    generatingIconCircle: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: c.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 24,
      shadowColor: c.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    generatingTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: c.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    generatingSubtitle: {
      fontSize: 14,
      color: c.textSecondary,
      textAlign: 'center',
      marginBottom: 24,
      lineHeight: 20,
    },
    generatingLoaderContainer: {
      marginTop: 8,
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
      borderColor: c.border,
      minHeight: 180,
    },
    createCardIcon: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: c.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
    },
    createSubtext: {
      fontSize: 11,
      color: c.textSecondary,
      textAlign: 'center',
      marginTop: 4,
      paddingHorizontal: 8,
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
      paddingHorizontal: 24,
    },
    emptyIconContainer: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: c.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 24,
    },
    emptyActions: {
      flexDirection: 'row',
      marginTop: 24,
      gap: 12,
    },
    emptyButtonSecondary: {
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.primary,
    },
    emptyButtonTextSecondary: {
      color: c.primary,
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
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 16,
    },
    backButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: c.surface,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    studyTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: c.text,
      flex: 1,
      textAlign: 'center',
      marginHorizontal: 12,
    },
    progressBadge: {
      backgroundColor: c.primaryLight,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
    },
    studyProgress: {
      fontSize: 13,
      fontWeight: '600',
      color: c.primary,
    },
    progressBarBg: {
      height: 6,
      backgroundColor: c.surface,
      marginHorizontal: 20,
      borderRadius: 3,
      marginBottom: 24,
    },
    progressBarFill: {
      height: '100%',
      backgroundColor: c.primary,
      borderRadius: 3,
    },
    cardContainer: {
      flex: 1,
      paddingHorizontal: 20,
      justifyContent: 'center',
    },
    flashcard: {
      minHeight: 380,
      maxHeight: '85%',
      backgroundColor: c.surface,
      borderRadius: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 8,
      borderWidth: 1,
      borderColor: c.border,
    },
    flashcardInner: {
      flex: 1,
      position: 'absolute',
      width: '100%',
      height: '100%',
    },
    cardFrontInner: {
      flex: 1,
      paddingHorizontal: 20,
      paddingVertical: 20,
      backgroundColor: c.surface,
      borderRadius: 24,
    },
    cardBackInner: {
      flex: 1,
      paddingHorizontal: 20,
      paddingVertical: 20,
      backgroundColor: c.primary,
      borderRadius: 24,
    },
    cardContentWrapper: {
      flex: 1,
      justifyContent: 'space-between',
    },
    cardHeaderSection: {
      alignItems: 'center',
      paddingTop: 4,
    },
    cardMainContent: {
      flex: 1,
      justifyContent: 'center',
      paddingVertical: 12,
    },
    cardScrollContent: {
      flex: 1,
      maxHeight: 220,
    },
    cardFooterSection: {
      alignItems: 'center',
      paddingBottom: 4,
    },
    cardScrollContentContainer: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 4,
    },
    cardFront: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 24,
      paddingVertical: 32,
      backgroundColor: c.surface,
      borderRadius: 24,
    },
    cardBack: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 24,
      paddingVertical: 32,
      backgroundColor: c.primary,
      borderRadius: 24,
    },
    cardLabel: {
      fontSize: 11,
      fontWeight: '700',
      color: c.primary,
      letterSpacing: 1,
    },
    cardTerm: {
      fontSize: 20,
      fontWeight: '600',
      color: c.text,
      textAlign: 'center',
      lineHeight: 28,
    },
    cardDefinition: {
      fontSize: 18,
      fontWeight: '600',
      color: '#FFFFFF',
      textAlign: 'center',
      lineHeight: 26,
    },
    tapHint: {
      fontSize: 12,
      color: c.textSecondary,
      fontWeight: '500',
    },
    labelContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.primaryLight,
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: 16,
      marginBottom: 12,
      gap: 5,
    },
    labelContainerBack: {
      backgroundColor: 'rgba(255,255,255,0.2)',
    },
    cardLabelBack: {
      color: '#FFFFFF',
    },
    tapHintContainer: {
      position: 'absolute',
      bottom: 20,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    tapHintContainerBack: {
      position: 'absolute',
      bottom: 20,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    tapHintBack: {
      fontSize: 13,
      color: 'rgba(255,255,255,0.7)',
      fontWeight: '500',
    },
    navButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 20,
      gap: 16,
    },
    navButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 14,
      paddingHorizontal: 20,
      backgroundColor: c.surface,
      borderRadius: 14,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
      borderWidth: 1,
      borderColor: c.border,
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
