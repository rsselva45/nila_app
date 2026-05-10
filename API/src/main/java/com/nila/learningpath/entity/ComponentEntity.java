package com.nila.learningpath.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "components")
public class ComponentEntity {

	@Id
	@Column(name = "id", nullable = false, length = 100)
	private String id;

	@Column(name = "title", nullable = false, length = 150)
	private String title;

	@Column(name = "short_description", nullable = false, length = 280)
	private String shortDescription;

	@Column(name = "type", nullable = false, length = 20)
	private String type;

	@Column(name = "approximate_duration_minutes", nullable = false)
	private int approximateDurationMinutes;

	/**
	 * Stores the metadata object as a JSON string, e.g.
	 * {"assessment":{"maxScore":100,"passingScore":50}}
	 */
	@Column(name = "metadata_json", columnDefinition = "TEXT")
	private String metadataJson;

	// ── Getters & setters ────────────────────────────────────────────────────

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public String getShortDescription() {
		return shortDescription;
	}

	public void setShortDescription(String shortDescription) {
		this.shortDescription = shortDescription;
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public int getApproximateDurationMinutes() {
		return approximateDurationMinutes;
	}

	public void setApproximateDurationMinutes(int approximateDurationMinutes) {
		this.approximateDurationMinutes = approximateDurationMinutes;
	}

	public String getMetadataJson() {
		return metadataJson;
	}

	public void setMetadataJson(String metadataJson) {
		this.metadataJson = metadataJson;
	}
}
