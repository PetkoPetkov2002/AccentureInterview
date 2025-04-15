"use client";

import { useVersionContext } from './VersionContext';
import { useSuggestionContext } from './page';
import styles from './VersionItem.module.css';

export default function VersionItem({ jobDescription, isCurrentVersion}) {
  const { expandedVersion, handleVersionSelect } = useVersionContext();
  const { applySuggestion } = useSuggestionContext();
  
  const isExpanded = expandedVersion === jobDescription.version;
  const hasRecommendations = jobDescription.gender_recommendations && 
                            jobDescription.gender_recommendations.responses && 
                            jobDescription.gender_recommendations.responses.length > 0;
  
  return (
    <div 
      className={`${styles.versionItem} ${isExpanded ? styles.expanded : ''} ${isCurrentVersion ? styles.currentVersion : ''}`}
    >
      <div className={styles.versionHeader} onClick={() => handleVersionSelect(jobDescription)}>
        <div className={styles.versionNumber}>
          <span>v{jobDescription.version}</span>
        </div>
        
        <div className={styles.versionInfo}>
          <h3 className={styles.versionTitle}>{jobDescription.title}</h3>
          {!isExpanded && (
            <p className={styles.versionDescription}>
              {jobDescription.description.length > 100 
                ? `${jobDescription.description.substring(0, 100)}...` 
                : jobDescription.description}
            </p>
          )}
        </div>
        
        <div className={styles.expandIcon}>
          {isExpanded ? '▼' : '▶'}
        </div>
      </div>
      
      {isExpanded && (
        <div className={styles.suggestionsContainer}>
          
          {hasRecommendations ? (
            <div className={styles.suggestionsSection}>
              <h4 className={styles.suggestionsTitle}>Gender Neutrality Recommendations</h4>
              <div className={styles.suggestionsList}>
                {jobDescription.gender_recommendations.responses.map((recommendation, index) => (
                  <div key={index} className={styles.suggestionItem}>
                    <div className={styles.suggestionHeader}>
                      <span className={styles.suggestionType}>Gendered Language</span>
                    </div>
                    <div className={styles.suggestionContent}>
                      <div className={styles.genderedItem}>
                        <span className={styles.labelText}>Original:</span>
                        <p className={styles.originalText}>&quot;{recommendation.gendered_item}&quot;</p>
                      </div>
                      <div className={styles.recommendationItem}>
                        <span className={styles.labelText}>Suggestion:</span>
                        <p className={styles.suggestionText}>&quot;{recommendation.recommendation}&quot;</p>
                      </div>
                      {isCurrentVersion && (
                        <button 
                          className={styles.applyButton}
                          onClick={() => applySuggestion(
                            recommendation.gendered_item, 
                            recommendation.recommendation,
                            jobDescription
                          )}
                        >
                          Apply Change
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className={styles.noSuggestions}>No gender neutrality recommendations available</p>
          )}
        </div>
      )}
    </div>
  );
} 