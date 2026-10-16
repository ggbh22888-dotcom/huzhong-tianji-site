// Sonnet 5.5 defaults to adaptive thinking. The original 4,000-token cap
// includes that thinking, so difficult charts can end without any visible text.
// These charts are already computed: reserve the cap for the interpretation.
export function readingOptions(model) {
  return {
    model,
    max_tokens: 4000,
    ...(model.startsWith('claude-sonnet-5-5') ? {
      thinking: { type: 'between_tools' },
      output_config: { effort: 'medium' },
    } : {}),
  };
}
