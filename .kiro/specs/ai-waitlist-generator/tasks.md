# Implementation Plan: AI-Powered Waitlist Generator

## Overview

This implementation plan breaks down the AI-Powered Waitlist Generator into discrete, incremental coding tasks. The feature transforms waitlist creation from a manual process into an intelligent, automated workflow where users provide minimal product information and receive a complete, production-ready waitlist page.

The implementation follows a bottom-up approach: core utilities → services → API endpoints → frontend UI → integration and testing.

## Tasks

- [x] 1. Set up core utilities and validation
  - [x] 1.1 Create slug generation utility
    - Implement `generateSlug()` function in `server/utils/slug-generator.ts`
    - Handle special character removal, space-to-hyphen conversion
    - Ensure lowercase conversion and length constraints (3-50 chars)
    - Remove leading/trailing hyphens
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 18.1_
  
  - [ ]* 1.2 Write property test for slug generation
    - **Property 16: Slug Format Validity**
    - **Property 17: Slug Special Character Removal**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 18.1_
  
  - [x] 1.3 Create color validation utility
    - Implement `isValidHexColor()` function in `server/utils/color-validator.ts`
    - Validate hex color format (#[0-9A-Fa-f]{6})
    - _Requirements: 3.2, 16.1_
  
  - [x] 1.4 Create contrast checker utility
    - Implement `checkContrast()` function in `server/utils/contrast-checker.ts`
    - Calculate WCAG contrast ratios
    - Validate WCAG AA compliance (4.5:1 for normal text, 3:1 for large text)
    - _Requirements: 3.6_
  
  - [ ]* 1.5 Write property test for color validation
    - **Property 6: Valid Color Format**
    - **Property 10: WCAG AA Contrast Compliance**
    - **Validates: Requirements 3.2, 3.6, 16.1**
  
  - [x] 1.6 Create input validation utility
    - Implement `validateGenerationRequest()` function in `server/utils/input-validator.ts`
    - Validate product name (1-100 chars)
    - Validate product description (10-500 chars)
    - Return structured validation errors
    - _Requirements: 1.5, 1.6, 1.7_
  
  - [ ]* 1.7 Write property test for input validation
    - **Property 1: Input Validation Bounds**
    - **Validates: Requirements 1.5, 1.6**

- [x] 2. Implement fallback generator service
  - [x] 2.1 Create fallback generator service
    - Implement `FallbackGeneratorService` class in `server/services/fallback-generator.service.ts`
    - Implement `generateDesign()` method with minimal template, neutral colors, standard fonts
    - Implement `generateCopy()` method using user-provided description
    - Implement `generateSlug()` method using slug utility
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.8_
  
  - [ ]* 2.2 Write unit tests for fallback generator
    - Test default template selection (minimal)
    - Test default color scheme generation
    - Test default font selection
    - Test slug generation from product name
    - _Requirements: 11.2, 11.3, 11.4, 11.5_
  
  - [ ]* 2.3 Write property test for fallback completeness
    - **Property 32: Fallback Generation Completeness**
    - **Property 33: Fallback Copy Usage**
    - **Validates: Requirements 11.2, 11.3, 11.4, 11.5, 11.6, 11.8**

- [ ] 3. Implement Gemini integration service
  - [ ] 3.1 Create Gemini integration service
    - Implement `GeminiIntegrationService` class in `server/services/gemini-integration.service.ts`
    - Implement `generateJSON()` method with JSON parsing and markdown code block handling
    - Implement `generateText()` method for text responses
    - Implement `retryWithBackoff()` method with exponential backoff (max 2 retries)
    - Implement error handling for API failures, timeouts, quota exceeded
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.7, 6.8, 6.9_
  
  - [ ]* 3.2 Write unit tests for Gemini integration
    - Test successful JSON response parsing
    - Test markdown code block extraction
    - Test retry logic with exponential backoff
    - Test timeout handling
    - Test API error handling
    - _Requirements: 6.3, 6.4, 6.5, 6.7, 6.8_
  
  - [ ]* 3.3 Write property test for JSON parsing
    - **Property 19: JSON Response Parsing**
    - **Validates: Requirements 6.3, 6.4**

- [ ] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Implement context analyzer service
  - [ ] 5.1 Create context analyzer service
    - Implement `ContextAnalyzerService` class in `server/services/context-analyzer.service.ts`
    - Implement `analyze()` method to determine category, industry, tone, target audience
    - Implement `extractKeywords()` helper method
    - Implement `determineCategory()` helper method
    - Implement `determineTone()` helper method
    - Use Gemini API for context analysis with fallback to heuristics
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_
  
  - [ ]* 5.2 Write unit tests for context analyzer
    - Test SaaS category identification
    - Test B2B tone determination (professional)
    - Test keyword extraction
    - Test fallback to neutral defaults on failure
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.6_
  
  - [ ]* 5.3 Write property test for context analysis
    - **Property 3: Context Analysis Completeness**
    - **Property 4: Fallback on Analysis Failure**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.6**

- [ ] 6. Implement design generator service
  - [ ] 6.1 Create design generator service
    - Implement `DesignGeneratorService` class in `server/services/design-generator.service.ts`
    - Implement `generateDesign()` method to produce complete design package
    - Implement `selectTemplate()` method using template selection rules
    - Implement `generateColorScheme()` method using industry color palettes
    - Implement `selectFontPair()` method using tone-based font pairings
    - Implement `generateBackground()` method based on template and colors
    - Implement `validateContrast()` method using contrast checker utility
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_
  
  - [ ]* 6.2 Write unit tests for design generator
    - Test template selection for different product categories
    - Test color scheme generation for different industries
    - Test font pairing selection for different tones
    - Test background generation for different templates
    - Test contrast validation
    - _Requirements: 3.1, 3.2, 3.3, 3.6, 3.7_
  
  - [ ]* 6.3 Write property tests for design generation
    - **Property 5: Valid Template Selection**
    - **Property 7: Valid Font Selection**
    - **Property 8: Valid Background Type**
    - **Property 11: Template Selection Rules**
    - **Property 12: Design Package Completeness**
    - **Validates: Requirements 3.1, 3.3, 3.4, 3.7, 3.8, 16.4, 16.5**

- [ ] 7. Implement copy generator service
  - [ ] 7.1 Create copy generator service
    - Implement `CopyGeneratorService` class in `server/services/copy-generator.service.ts`
    - Implement `generateCopy()` method to produce complete copy content
    - Implement `generateHeadline()` method (30-80 chars)
    - Implement `generateTagline()` method
    - Implement `generateDescription()` method (100-300 chars)
    - Implement `generateCTA()` method (10-30 chars)
    - Implement `generateFeatures()` method (3-5 features with icons, titles, descriptions)
    - Implement `validateCopyLength()` method
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9_
  
  - [ ]* 7.2 Write unit tests for copy generator
    - Test headline generation within length constraints
    - Test description generation within length constraints
    - Test CTA generation within length constraints
    - Test feature generation (3-5 features)
    - Test tone appropriateness for different audiences
    - _Requirements: 4.1, 4.3, 4.4, 4.5, 4.7_
  
  - [ ]* 7.3 Write property tests for copy generation
    - **Property 13: Copy Length Constraints**
    - **Property 14: Feature Highlights Structure**
    - **Property 15: Conditional Testimonial Generation**
    - **Validates: Requirements 4.1, 4.3, 4.4, 4.5, 4.6, 16.3**

- [ ] 8. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Implement output validator service
  - [ ] 9.1 Create output validator service
    - Implement `OutputValidatorService` class in `server/services/output-validator.service.ts`
    - Implement `validate()` method to validate complete generation response
    - Implement `validateDesign()` method (colors, template, fonts, background)
    - Implement `validateCopy()` method (lengths, completeness)
    - Implement `validateSlug()` method (format, length)
    - Implement `validateColorContrast()` method
    - Return structured validation results with errors and warnings
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5, 16.6, 16.7_
  
  - [ ]* 9.2 Write unit tests for output validator
    - Test color validation (valid and invalid hex codes)
    - Test slug validation (valid and invalid formats)
    - Test copy length validation
    - Test template validation
    - Test font validation
    - Test contrast validation
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5_

- [ ] 10. Implement main generation service
  - [ ] 10.1 Create generation service orchestrator
    - Implement `GenerationService` class in `server/services/generation.service.ts`
    - Implement `generate()` method to orchestrate full generation pipeline
    - Call context analyzer, design generator, copy generator in sequence
    - Handle parallel generation of design and copy where possible
    - Implement slug generation with uniqueness checking
    - Implement fallback logic when Gemini API fails
    - Validate output before returning
    - Track generation metadata (duration, fallback usage, confidence)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.8, 6.5, 6.6, 11.1, 11.7, 12.1, 12.2, 12.3, 12.4, 16.7_
  
  - [ ] 10.2 Implement regeneration method
    - Implement `regenerate()` method in `GenerationService`
    - Use same product context as original generation
    - Vary temperature or seed to produce different output
    - Preserve manual edits if they exist
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8_
  
  - [ ] 10.3 Implement slug uniqueness checking
    - Query database for existing slugs
    - Append numeric suffix if slug exists
    - Retry until unique slug found
    - _Requirements: 5.5, 5.6, 10.5, 18.5_
  
  - [ ]* 10.4 Write integration tests for generation service
    - Test complete generation flow from request to response
    - Test fallback usage when API fails
    - Test slug uniqueness enforcement
    - Test regeneration with same inputs produces different output
    - Test manual edit preservation on regeneration
    - _Requirements: 8.3, 8.4, 8.8, 11.1, 18.5_
  
  - [ ]* 10.5 Write property tests for generation service
    - **Property 2: Input Preservation on Failure**
    - **Property 18: Slug Uniqueness Enforcement**
    - **Property 20: API Failure Fallback**
    - **Property 24: Regeneration Input Preservation**
    - **Property 26: Manual Edit Preservation on Regeneration**
    - **Validates: Requirements 1.8, 5.5, 5.6, 6.5, 6.6, 6.8, 8.3, 8.8, 10.5, 11.1, 18.5, 18.6**

- [ ] 11. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. Create API endpoints for generation
  - [ ] 12.1 Create generation routes file
    - Create `server/routes/generation.routes.ts`
    - Set up Express router with authentication middleware
    - _Requirements: 17.6_
  
  - [ ] 12.2 Implement POST /api/waitlists/generate endpoint
    - Accept productName, shortDescription, industry, targetAudience in request body
    - Validate input using input validator
    - Call generation service
    - Return complete generation response (design, copy, slug, metadata)
    - Handle errors with structured error responses
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8_
  
  - [ ] 12.3 Implement POST /api/waitlists/regenerate endpoint
    - Accept productName, shortDescription, previousResult in request body
    - Call regeneration method
    - Display warning if manual edits exist
    - Return new generation response
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 9.8_
  
  - [ ] 12.4 Implement POST /api/waitlists/validate-slug endpoint
    - Accept slug in request body
    - Check database for slug uniqueness
    - Return availability status and suggestion if taken
    - _Requirements: 5.5, 5.6_
  
  - [ ]* 12.5 Write API endpoint tests
    - Test /generate endpoint with valid input
    - Test /generate endpoint with invalid input (validation errors)
    - Test /generate endpoint with API failure (fallback usage)
    - Test /regenerate endpoint
    - Test /validate-slug endpoint
    - _Requirements: 1.5, 1.6, 1.7, 5.5, 5.6, 8.1, 11.1_
  
  - [ ] 12.6 Register generation routes in main server
    - Import and mount generation routes in `server/index.ts`
    - _Requirements: 17.6_

- [ ] 13. Create frontend generation UI
  - [ ] 13.1 Create generation state management
    - Define `GenerationState` interface in `src/pages/CreateWaitlist.tsx`
    - Set up state for: step (input/generating/preview/refining), productName, shortDescription, generated result, generating flag, error, manual edits
    - _Requirements: 7.1, 9.1_
  
  - [ ] 13.2 Implement input form UI
    - Create form with product name input (1-100 chars)
    - Create form with product description textarea (10-500 chars)
    - Add optional industry and target audience fields
    - Display field-specific validation errors
    - Add "Generate with AI" button
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_
  
  - [ ] 13.3 Implement generation loading state
    - Display loading indicator during generation
    - Show generation progress (analyzing, designing, writing copy)
    - Display "taking longer than usual" message after 15 seconds
    - _Requirements: 12.2, 12.3, 12.7_
  
  - [ ] 13.4 Implement handleGenerate function
    - Validate input before submitting
    - Call POST /api/waitlists/generate endpoint
    - Handle success: transition to preview step
    - Handle errors: display error message, preserve input
    - Handle fallback notification
    - _Requirements: 1.7, 1.8, 11.7, 12.1_
  
  - [ ]* 13.5 Write unit tests for CreateWaitlist component
    - Test input validation
    - Test form submission
    - Test error handling
    - Test loading state display
    - _Requirements: 1.5, 1.6, 1.7, 1.8_

- [ ] 14. Create preview renderer component
  - [ ] 14.1 Create PreviewRenderer component
    - Create `src/components/generation/PreviewRenderer.tsx`
    - Accept design, copy, slug as props
    - Implement responsive view mode toggle (desktop/tablet/mobile)
    - _Requirements: 7.1, 7.8_
  
  - [ ] 14.2 Implement template rendering
    - Dynamically load and render selected template
    - Apply generated customizations (colors, fonts, background)
    - Display generated copy (headline, description, CTA)
    - Display generated features if applicable
    - Display generated URL slug
    - _Requirements: 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_
  
  - [ ]* 14.3 Write property test for preview completeness
    - **Property 22: Preview Content Completeness**
    - **Property 23: Conditional Feature Display**
    - **Validates: Requirements 7.2, 7.3, 7.4, 7.5, 7.6**

- [ ] 15. Implement manual editing and regeneration
  - [ ] 15.1 Add manual customization controls to preview
    - Add template selector dropdown
    - Add color picker for primary color
    - Add font selector dropdown
    - Add background type and value controls
    - Add text editors for headline, description, CTA
    - Add slug editor with validation
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_
  
  - [ ] 15.2 Implement real-time preview updates
    - Update preview immediately when manual changes are made
    - Track which fields have been manually edited
    - _Requirements: 9.6, 9.7_
  
  - [ ] 15.3 Implement regeneration button
    - Add "Regenerate" button to preview
    - Display warning modal if manual edits exist
    - Call POST /api/waitlists/regenerate endpoint
    - Update preview with new generation
    - _Requirements: 8.1, 8.2, 8.6, 8.7, 9.8_
  
  - [ ] 15.4 Implement handleManualEdit function
    - Track manual edits in state
    - Update preview in real-time
    - Preserve manual edits when regenerating
    - _Requirements: 9.6, 9.7, 8.8_
  
  - [ ]* 15.5 Write property tests for manual editing
    - **Property 27: Manual Edit Warning**
    - **Property 28: Real-time Preview Updates**
    - **Property 29: Manual Edit Persistence**
    - **Validates: Requirements 9.6, 9.7, 9.8**

- [ ] 16. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 17. Implement save and publish functionality
  - [ ] 17.1 Implement handleSave function
    - Validate slug uniqueness before saving
    - Prepare complete waitlist configuration
    - Call existing POST /api/waitlists endpoint
    - Save all design package values to database
    - Save all copy content to database
    - Save URL slug to database
    - Handle save success: redirect to dashboard
    - Handle save failure: display error, preserve configuration
    - Handle duplicate slug: suggest alternative
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7_
  
  - [ ]* 17.2 Write property tests for save functionality
    - **Property 30: Complete Data Persistence**
    - **Property 31: Save Failure State Preservation**
    - **Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.7**

- [ ] 18. Add generation metadata tracking (optional)
  - [ ] 18.1 Create generation_logs table
    - Create migration for generation_logs table
    - Add indexes for user_id and created_at
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 15.7_
  
  - [ ] 18.2 Implement generation logging
    - Log each generation request with metadata
    - Track generation duration, fallback usage, template selected
    - Track regeneration count
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.7_

- [ ] 19. Handle edge cases and error scenarios
  - [ ] 19.1 Implement special character handling in slug generation
    - Handle emoji and unicode characters
    - Handle non-English characters
    - Test with various special characters
    - _Requirements: 18.1, 18.7, 18.8_
  
  - [ ] 19.2 Implement short description handling
    - Request more information if description too short
    - Use fallback if description remains short
    - _Requirements: 18.2_
  
  - [ ] 19.3 Implement long description handling
    - Truncate or summarize long descriptions
    - Preserve key information
    - _Requirements: 18.3_
  
  - [ ] 19.4 Implement vague context handling
    - Make reasonable assumptions
    - Inform user of assumptions made
    - _Requirements: 18.4_
  
  - [ ]* 19.5 Write property test for edge cases
    - **Property 37: Unicode and Emoji Handling**
    - **Validates: Requirements 18.7, 18.8**

- [ ] 20. Integration and final wiring
  - [ ] 20.1 Update navigation to AI generation flow
    - Update "Create Waitlist" button to navigate to new AI generation page
    - Ensure authentication is required
    - _Requirements: 17.1, 17.2, 17.6_
  
  - [ ] 20.2 Maintain backward compatibility
    - Ensure existing waitlists continue to work
    - Ensure existing database schema is preserved
    - Test with existing waitlist data
    - _Requirements: 17.3, 17.5_
  
  - [ ] 20.3 Add opt-out for manual creation (optional)
    - Add "Create manually" link for users who prefer manual flow
    - Preserve existing manual creation flow
    - _Requirements: 17.4_
  
  - [ ]* 20.4 Write end-to-end tests
    - Test complete user flow from input to published waitlist
    - Test regeneration flow
    - Test manual editing flow
    - Test error scenarios (API failure, validation errors, save failures)
    - _Requirements: 1.1, 1.2, 7.1, 8.1, 9.1, 10.1_

- [ ] 21. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation throughout implementation
- Property tests validate universal correctness properties across all inputs
- Unit tests validate specific examples, edge cases, and integration points
- The implementation uses TypeScript throughout
- The system integrates with existing WaitlistFast infrastructure (templates, customization, database)
- Fallback generation ensures the system works even when AI is unavailable
- All generated output is validated before being presented to users
