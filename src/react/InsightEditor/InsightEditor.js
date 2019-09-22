import React, { Component } from 'react'
import { ApolloProvider } from 'react-apollo'
import PropTypes from 'prop-types'
import sanitizeHtml from 'sanitize-html/dist/sanitize-html'
import debounce from 'lodash.debounce'
import { convertToRaw } from 'draft-js'
import mediumDraftImporter from 'medium-draft/lib/importer'
import mediumDraftExporter from 'medium-draft/lib/exporter'
import { createEditorState } from 'medium-draft'
import Editor from '../Editor/Editor'
import InsightEditorBottom from './InsightEditorBottom'
import InsightEditorTitle from './InsightEditorTitle'
import { client } from '../../apollo'
import styles from './InsightEditor.module.scss'

const removeAmpersandRepetitions = str =>
  str.replace(/(?!<a(.*)>(.*))(&amp;)(?=(.*)<\/a>)/gi, '&')

const sanitizeMediumDraftHtml = html =>
  removeAmpersandRepetitions(
    sanitizeHtml(html, {
      allowedTags: [
        ...sanitizeHtml.defaults.allowedTags,
        'figure',
        'figcaption',
        'img',
        'h1',
        'h2',
        'u',
      ],
      allowedAttributes: {
        ...sanitizeHtml.defaults.allowedAttributes,
        '*': ['class', 'id'],
      },
    }),
  )

class InsightEditor extends Component {
  static propTypes = {
    updateDraft: PropTypes.func.isRequired,
  }

  static defaultProps = {
    title: '',
    text: '',
    tags: [],
  }

  defaultEditorContent = convertToRaw(mediumDraftImporter(this.props.text))

  state = {
    title: this.props.title,
    textEditorState: createEditorState(this.defaultEditorContent),
    tags: this.props.tags,
    defaultTags: this.props.tags,
    isEditing: false,
  }

  componentDidUpdate({ tags }) {
    const { defaultTags } = this.state
    const { tags: currentTags } = this.props
    if (!tags.length && !defaultTags.length && currentTags.length > 0) {
      this.setState({ defaultTags: this.props.tags })
    }
  }

  trendTag = this.props.tags.find(({ name }) =>
    name.endsWith('-trending-words'),
  )

  onTitleChange = title => {
    this.setState(
      {
        title,
        isEditing: true,
      },
      this.updateDraft,
    )
  }

  onTextChange = textEditorState => {
    const currentContent = textEditorState.getCurrentContent()
    if (
      mediumDraftExporter(currentContent) ===
      mediumDraftExporter(this.state.textEditorState.getCurrentContent())
    ) {
      return
    }

    this.setState(
      {
        textEditorState,
        isEditing: true,
      },
      () => this.updateDraft(currentContent),
    )
  }

  onTagsChange = tags => {
    this.setState(
      {
        tags,
        isEditing: true,
        isTagsModified: true,
      },
      this.updateDraft,
    )
  }

  isTitleAndTextOk() {
    const { title, textEditorState } = this.state

    const trimmedTitle = title.trim()
    const trimmedText = textEditorState
      .getCurrentContent()
      .getPlainText()
      .trim()

    return { title: trimmedTitle.length > 5, text: trimmedText.length > 5 }
  }

  // NOTE(vanguard): Maybe should be placed in the InsightsEditorPage?
  updateDraft = debounce(
    (currentContent = this.state.textEditorState.getCurrentContent()) => {
      const { title, tags } = this.state
      const { readyState } = this.props

      if (readyState === 'published' || !this.isTitleAndTextOk()) {
        return
      }

      const currentHtml = mediumDraftExporter(currentContent)
      const { id, updateDraft } = this.props

      updateDraft({
        id,
        title,
        text: sanitizeMediumDraftHtml(currentHtml),
        tags: this.trendTag ? [...tags, this.trendTag] : tags,
      })

      this.setState(prevState => ({ ...prevState, isEditing: false }))
    },
    1000,
  )

  render() {
    const { id, title, updatedAt, isUpdating, publishDraft } = this.props
    const { isEditing, defaultTags, isTagsModified } = this.state
    const tags = isTagsModified ? this.state.tags : defaultTags

    const isLoading = isEditing || isUpdating

    return (
      <ApolloProvider client={client}>
        <div className={styles.wrapper}>
          <div className={styles.insightWrapper}>
            <InsightEditorTitle
              maxLength='140'
              defaultValue={title}
              onChange={this.onTitleChange}
            />
            <Editor
              defaultEditorContent={this.defaultEditorContent}
              placeholder='Write something interesting ...'
              onChange={this.onTextChange}
            />
          </div>
          <InsightEditorBottom
            defaultTags={tags}
            updatedAt={updatedAt}
            onTagsChange={this.onTagsChange}
            isLoading={isLoading}
            hasMetTextRequirements={this.isTitleAndTextOk()}
            onPublishClick={() => publishDraft(id)}
          />
        </div>
      </ApolloProvider>
    )
  }
}

export default InsightEditor
