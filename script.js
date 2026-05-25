const STORAGE_TASKS_KEY = 'studentTasks';
const STORAGE_PERMISSION_KEY = 'notificationPermission';
const SETTINGS_KEY = 'notificationSettings';
const EMAIL_API_URL = 'http://localhost:5000';

const defaultSettings = {
  browserNotifications: true,
  emailReminders: true,
  defaultReminderInterval: 1440,
};

let tasks = JSON.parse(localStorage.getItem(STORAGE_TASKS_KEY)) || [];
let settings = loadSettings();
let reminderTimers = [];

initializeApp();

function initializeApp() {
  normalizeTasks();
  bindUi();
  applySettingsToUi();
  updateNotificationStatus();

  if (settings.browserNotifications && 'Notification' in window && Notification.permission === 'default') {
    requestNotificationPermission();
  }

  displayTasks();
  schedulePendingNotifications();
  setInterval(checkPendingReminders, 60_000);
}

function bindUi() {
  const form = document.getElementById('taskForm');
  const permissionButton = document.getElementById('requestPermissionBtn');
  const clearCompletedButton = document.getElementById('clearCompletedBtn');
  const browserToggle = document.getElementById('browserNotificationsToggle');
  const emailToggle = document.getElementById('emailRemindersToggle');
  const defaultInterval = document.getElementById('defaultReminderInterval');

  if (form) {
    form.addEventListener('submit', event => {
      event.preventDefault();
      addTask();
    });
  }

  if (permissionButton) {
    permissionButton.addEventListener('click', requestNotificationPermission);
  }

  if (clearCompletedButton) {
    clearCompletedButton.addEventListener('click', clearCompletedTasks);
  }

  if (browserToggle) {
    browserToggle.addEventListener('change', event => {
      settings.browserNotifications = event.target.checked;
      saveSettings();
      updateNotificationStatus();

      if (settings.browserNotifications && Notification.permission === 'default') {
        requestNotificationPermission();
      }
    });
  }

  if (emailToggle) {
    emailToggle.addEventListener('change', event => {
      settings.emailReminders = event.target.checked;
      saveSettings();
    });
  }

  if (defaultInterval) {
    defaultInterval.addEventListener('change', event => {
      settings.defaultReminderInterval = Number(event.target.value) || defaultSettings.defaultReminderInterval;
      saveSettings();
    });
  }
}

function loadSettings() {
  const raw = localStorage.getItem(SETTINGS_KEY);
  if (!raw) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(defaultSettings));
    return { ...defaultSettings };
  }

  try {
    const parsed = JSON.parse(raw);
    return {
      browserNotifications: parsed.browserNotifications !== false,
      emailReminders: parsed.emailReminders !== false,
      defaultReminderInterval: Number(parsed.defaultReminderInterval) || defaultSettings.defaultReminderInterval,
    };
  } catch (error) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(defaultSettings));
    return { ...defaultSettings };
  }
}

function saveSettings() {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

function applySettingsToUi() {
  const browserToggle = document.getElementById('browserNotificationsToggle');
  const emailToggle = document.getElementById('emailRemindersToggle');
  const defaultInterval = document.getElementById('defaultReminderInterval');

  if (browserToggle) {
    browserToggle.checked = Boolean(settings.browserNotifications);
  }
  if (emailToggle) {
    emailToggle.checked = Boolean(settings.emailReminders);
  }
  if (defaultInterval) {
    defaultInterval.value = String(settings.defaultReminderInterval);
  }
}

function normalizeTasks() {
  tasks = tasks.map(task => {
    if (!task.id) task.id = Date.now() + Math.random();
    task.reminderInterval = Number(task.reminderInterval) || settings.defaultReminderInterval;
    task.browserNotified = Boolean(task.browserNotified);
    task.emailNotified = Boolean(task.emailNotified);

    const deadline = new Date(task.deadline);
    if (isNaN(deadline.getTime())) {
      return task;
    }

    const expectedReminderTime = new Date(deadline.getTime() - task.reminderInterval * 60_000).toISOString();
    if (!task.reminderTime || task.reminderTime !== expectedReminderTime) {
      task.reminderTime = expectedReminderTime;
    }

    return task;
  });

  saveTasks();
}

function requestNotificationPermission() {
  if (!('Notification' in window)) {
    alert('Browser notifications are not supported in this environment.');
    return;
  }

  Notification.requestPermission().then(permission => {
    localStorage.setItem(STORAGE_PERMISSION_KEY, permission);
    updateNotificationStatus(permission);

    if (permission === 'granted') {
      new Notification('Notifications enabled!', {
        body: 'You will receive browser reminders for upcoming task deadlines.',
      });
    }
  });
}

function updateNotificationStatus(overrideStatus) {
  const statusText = document.getElementById('notificationStatus');
  const button = document.getElementById('requestPermissionBtn');
  const stored = localStorage.getItem(STORAGE_PERMISSION_KEY);
  const browserStatus = ('Notification' in window) ? Notification.permission : 'unsupported';
  const resolvedStatus = overrideStatus || (browserStatus !== 'default' ? browserStatus : (stored || browserStatus));
  const displayStatus = settings.browserNotifications ? resolvedStatus : `${resolvedStatus} (disabled)`;

  if (statusText) {
    statusText.textContent = displayStatus;
  }

  if (button) {
    if (!settings.browserNotifications) {
      button.textContent = 'Enable browser notifications';
      button.disabled = false;
    } else if (resolvedStatus === 'granted') {
      button.textContent = 'Notifications enabled';
      button.disabled = true;
    } else if (resolvedStatus === 'denied') {
      button.textContent = 'Enable Notifications';
      button.disabled = false;
    } else if (resolvedStatus === 'unsupported') {
      button.textContent = 'Notifications unavailable';
      button.disabled = true;
    } else {
      button.textContent = 'Enable Notifications';
      button.disabled = false;
    }
  }
}

function addTask() {
  const titleInput = document.getElementById('taskTitle');
  const descriptionInput = document.getElementById('taskDescription');
  const deadlineInput = document.getElementById('taskDeadline');
  const reminderInput = document.getElementById('taskReminder');
  const emailInput = document.getElementById('taskEmail');
    const newNote = {
        id: Date.now(),
        title: title,
        content: noteText,
        tags: tagsText ? tagsText.split(',').map(t=>t.trim()).filter(Boolean) : [],
        subject: subjectText || '',
        pinned: false
    };

    notes.unshift(newNote);

    localStorage.setItem("notes", JSON.stringify(notes));

    document.getElementById('noteTitle').value = '';
    document.getElementById('noteInput').value = '';
    document.getElementById('noteTags').value = '';
    document.getElementById('noteSubject').value = '';

    refreshFilters();
    displayNotes();

    // Clear any saved draft after successful save
    clearDraft();

    // update global tags list and suggestions
    addGlobalTags(newNote.tags);
    renderSuggestedTags();
}

function displayNotes(){
    let container = document.getElementById("notesContainer");
    let pinnedContainer = document.getElementById('pinnedContainer');
    const pinnedSection = document.getElementById('pinnedSection');
    container.innerHTML = "";
    pinnedContainer.innerHTML = "";

    const q = searchQuery.trim();
    const tagsFilter = filterTags.map(t=>t.toLowerCase());
    const subjectFilter = filterSubject.toLowerCase();

    const favoritesContainer = document.getElementById('favoritesContainer');
    const favoritesSection = document.getElementById('favoritesSection');

    notes.forEach((note)=>{
        const combined = (note.title + ' ' + note.content).toLowerCase();

        // Filter by search query
        if(q){
            if(!combined.includes(q.toLowerCase())) return;
        }

        // Filter by tags
        if(tagsFilter.length){
            const noteTags = (note.tags || []).map(t=>t.toLowerCase());
            const hasTag = tagsFilter.every(t=>noteTags.includes(t));
            if(!hasTag) return;
        }

        // Filter by subject
        if(subjectFilter){
            if((note.subject || '').toLowerCase() !== subjectFilter) return;
        }

        const titleHtml = note.title ? `<div class="note-title">${escapeHtml(note.title)}</div>` : '';

        // Render markdown to HTML safely and then highlight text nodes
        let rawHtml = '';
        try{
            if(window.marked){
                rawHtml = marked.parse(note.content || '');
            } else {
                rawHtml = escapeHtml(note.content || '');
            }
        }catch(e){
            rawHtml = escapeHtml(note.content || '');
        }

        const safeHtml = (window.DOMPurify && DOMPurify.sanitize) ? DOMPurify.sanitize(rawHtml) : rawHtml;

        // Use a temporary element to perform text-node highlighting
        const tmp = document.createElement('div');
        tmp.innerHTML = safeHtml;
        if(q) highlightInElement(tmp, q);
        const contentHtml = `<div class="note-content">${tmp.innerHTML}</div>`;
        const subjectHtml = note.subject ? `<div class="note-subject">Subject: ${escapeHtml(note.subject)}</div>` : '';
        const tagsHtml = (note.tags || []).length ? `<div class="note-tags">${note.tags.map(t=>`<button type="button" class="tag" onclick="applyTagFilter(${JSON.stringify(t)})">${escapeHtml(t)}</button>`).join('')}</div>` : '';

        // Favorite & Pin buttons
        const favBtn = `<button class="favorite-btn ${note.favorite ? 'active' : ''}" onclick="toggleFavorite('${note.id}')" aria-label="Toggle favorite">${note.favorite ? '★' : '☆'}</button>`;
        const pinBtn = `<button class="pin-btn" onclick="togglePin('${note.id}')" aria-label="Toggle pin">${note.pinned ? 'Unpin' : 'Pin'}</button>`;

        const noteHtml = `
            <div class="note">
                ${favBtn}
                ${pinBtn}
                ${titleHtml}
                ${contentHtml}
                ${subjectHtml}
                ${tagsHtml}
                <button class="delete-btn" onclick="deleteNote('${note.id}')" aria-label="Delete note">X</button>
            </div>
        `;

        if(note.favorite){
            // favorites shown in dedicated section
            if(favoritesContainer) favoritesContainer.innerHTML += noteHtml;
        } else if(note.pinned){
            pinnedContainer.innerHTML += noteHtml;
        } else {
            container.innerHTML += noteHtml;
        }
    });

    // Show or hide pinned section
    if(pinnedContainer.children.length){
        pinnedSection.style.display = '';
    } else {
        pinnedSection.style.display = 'none';
    }
    if(favoritesContainer && favoritesSection){
        if(favoritesContainer.children.length){
            favoritesSection.style.display = '';
        } else {
            favoritesSection.style.display = 'none';
        }
    }

    // refresh suggested tag counts
    renderSuggestedTags();
}

// Walk DOM and wrap matching text in <mark> elements (case-insensitive)
function highlightInElement(element, query){
    if(!query) return;
    const q = String(query).trim();
    if(!q) return;
    const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'), 'ig');

    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);
    const nodes = [];
    while(walker.nextNode()) nodes.push(walker.currentNode);

    nodes.forEach(textNode => {
        const parent = textNode.parentNode;
        if(!parent) return;
        const text = textNode.nodeValue;
        if(!re.test(text)) return;
        const frag = document.createDocumentFragment();
        let lastIndex = 0;
        text.replace(re, (match, offset) => {
            const before = text.slice(lastIndex, offset);
            if(before) frag.appendChild(document.createTextNode(before));
            const mark = document.createElement('mark');
            mark.className = 'highlight';
            mark.textContent = match;
            frag.appendChild(mark);
            lastIndex = offset + match.length;
            return match;
        });
        const after = text.slice(lastIndex);
        if(after) frag.appendChild(document.createTextNode(after));
        parent.replaceChild(frag, textNode);
    });
}

function deleteNote(id){
    const idx = notes.findIndex(n=>String(n.id) === String(id));
    if(idx === -1) return;
    notes.splice(idx,1);

  const title = titleInput.value.trim();
  const description = descriptionInput.value.trim();
  const deadlineValue = deadlineInput.value;
  const reminderInterval = Number(reminderInput.value) || 1440;
  const emailAddress = emailInput.value.trim();

  if (!title) {
    alert('Please provide a task title.');
    return;
  }

  if (!deadlineValue) {
    alert('Please choose a deadline for the task.');
    return;
  }

  const deadline = new Date(deadlineValue);
  if (isNaN(deadline.getTime())) {
    alert('Please choose a valid deadline.');
    return;
  }

  const reminderTime = new Date(deadline.getTime() - reminderInterval * 60_000);

  const task = {
    id: Date.now() + Math.random(),
    title,
    description,
    deadline: deadline.toISOString(),
    reminderInterval,
    reminderTime: reminderTime.toISOString(),
    emailAddress,
    browserNotified: false,
    emailNotified: false,
    createdAt: new Date().toISOString(),
  };

  tasks.unshift(task);
  saveTasks();
  displayTasks();
  schedulePendingNotifications();
  formReset();
}

function formReset() {
  document.getElementById('taskForm').reset();
}
    refreshFilters();
    displayNotes();
}

function togglePin(id){
    const idx = notes.findIndex(n=>String(n.id) === String(id));
    if(idx === -1) return;
    notes[idx].pinned = !notes[idx].pinned;
    localStorage.setItem('notes', JSON.stringify(notes));
    displayNotes();
}

function toggleFavorite(id){
    const idx = notes.findIndex(n=>String(n.id) === String(id));
    if(idx === -1) return;
    notes[idx].favorite = !notes[idx].favorite;
    localStorage.setItem('notes', JSON.stringify(notes));
    displayNotes();
}

function refreshFilters(){
    // Populate subjects dropdown
    const select = document.getElementById('filterSubject');
    if(!select) return;
    const subjects = Array.from(new Set(notes.map(n=> (n.subject||'').trim()).filter(Boolean)));
    const current = select.value;
    select.innerHTML = '<option value="">All subjects</option>' + subjects.map(s=>`<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join('');
    select.value = current || '';
}

// Search and filter input wiring
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const filterTagsInput = document.getElementById('filterTags');
    const filterSubjectSelect = document.getElementById('filterSubject');
    const livePreviewToggle = document.getElementById('livePreviewToggle');
    const livePreview = document.getElementById('livePreview');
    const noteInput = document.getElementById('noteInput');
    const titleInput = document.getElementById('noteTitle');
    const tagsInput = document.getElementById('noteTags');
    const subjectInput = document.getElementById('noteSubject');
    const saveStatus = document.getElementById('saveStatus');

    if(searchInput){
        searchInput.addEventListener('input', (e)=>{
            searchQuery = e.target.value;
            displayNotes();
        });
    }

    if(filterTagsInput){
        filterTagsInput.addEventListener('input', (e)=>{
            const txt = e.target.value.trim();
            filterTags = txt ? txt.split(',').map(t=>t.trim()).filter(Boolean) : [];
            displayNotes();
        });
    }

    if(filterSubjectSelect){
        filterSubjectSelect.addEventListener('change', (e)=>{
            filterSubject = e.target.value;
            displayNotes();
        });
    }

    refreshFilters();
    // Restore any unsaved draft if present
    restoreDraft();
    // Wire autosave to inputs
    [noteInput, titleInput, tagsInput, subjectInput].forEach(inp=>{
        if(!inp) return;
        inp.addEventListener('input', ()=>{
            scheduleAutoSave();
        });
    });
    // Wire suggested tag add
    const newTagInput = document.getElementById('newTagInput');
    const addTagBtn = document.getElementById('addTagBtn');
    if(addTagBtn && newTagInput){
        addTagBtn.addEventListener('click', ()=>{
            const v = (newTagInput.value||'').trim();
            if(!v) return;
            addGlobalTags([v]);
            newTagInput.value = '';
            renderSuggestedTags();
        });
        newTagInput.addEventListener('keydown', (e)=>{ if(e.key === 'Enter'){ e.preventDefault(); addTagBtn.click(); } });
    }
    // Live preview handling
    if(noteInput && livePreview && livePreviewToggle){
        const updatePreview = () => {
            const isOn = livePreviewToggle.checked;
            livePreview.setAttribute('aria-hidden', isOn ? 'false' : 'true');
            if(!isOn){
                livePreview.style.display = 'none';
                return;
            }
            livePreview.style.display = 'block';
            const raw = noteInput.value || '';
            let html = raw;
            try{ html = window.marked ? marked.parse(raw) : escapeHtml(raw); }catch(e){ html = escapeHtml(raw); }
            const safe = (window.DOMPurify && DOMPurify.sanitize) ? DOMPurify.sanitize(html) : html;
            livePreview.innerHTML = safe;
        };

        noteInput.addEventListener('input', updatePreview);
        livePreviewToggle.addEventListener('change', updatePreview);
    }
});

function initTheme(){
    const toggleBtn = document.getElementById("themeToggle");

function saveTasks() {
  localStorage.setItem(STORAGE_TASKS_KEY, JSON.stringify(tasks));
}

function displayTasks() {
  const container = document.getElementById('tasksContainer');
  container.innerHTML = '';

  if (!tasks.length) {
    const emptyState = document.createElement('div');
    emptyState.className = 'task-card';
    emptyState.textContent = 'No tasks yet. Add one to start receiving reminders.';
    container.appendChild(emptyState);
    return;
  }

  tasks.forEach(task => container.appendChild(createTaskCard(task)));
}

function createTaskCard(task) {
  const deadline = new Date(task.deadline);
  const reminderTime = new Date(task.reminderTime);
  const now = Date.now();
  const isOverdue = now > deadline.getTime();
  const isReminderPast = now > reminderTime.getTime();
    const initialTheme = savedTheme === "dark" || savedTheme === "light"
        ? savedTheme
        : (systemPrefersDark ? "dark" : "light");

  const card = document.createElement('article');
  card.className = 'task-card';

  const header = document.createElement('header');
  const title = document.createElement('h3');
  title.textContent = task.title;
  header.appendChild(title);

  const status = document.createElement('div');
  status.className = 'task-meta';
  status.appendChild(createMetaTag(formatDateTime(deadline)));
  status.appendChild(createMetaTag(`Reminder ${formatDateTime(reminderTime)}`));

  if (task.emailAddress) {
    status.appendChild(createMetaTag('Email reminder configured'));
  }

  card.appendChild(header);
  card.appendChild(status);

  if (task.description) {
    const description = document.createElement('p');
    description.textContent = task.description;
    card.appendChild(description);
  }

  const badges = document.createElement('div');
  badges.className = 'task-meta';
  if (isOverdue) {
    badges.appendChild(createMetaTag('Overdue'));
  }

  if (task.emailAddress) {
    badges.appendChild(createMetaTag(task.emailNotified ? 'Email reminder sent' : 'Email reminder pending'));
  }

  if (isReminderPast && !task.browserNotified) {
    badges.appendChild(createMetaTag('Reminder due now'));
  }

  if (badges.childElementCount) {
    card.appendChild(badges);
  }

  const actions = document.createElement('div');
  actions.className = 'task-actions';

  const deleteButton = document.createElement('button');
  deleteButton.type = 'button';
  deleteButton.textContent = 'Delete task';
  deleteButton.addEventListener('click', () => deleteTask(task.id));
  actions.appendChild(deleteButton);

  if (task.emailAddress) {
    const emailButton = document.createElement('button');
    emailButton.type = 'button';
    emailButton.textContent = 'Send test email';
    emailButton.addEventListener('click', () => sendTestEmail(task));
    actions.appendChild(emailButton);
  }

  card.appendChild(actions);
  return card;
}

function createMetaTag(text) {
  const meta = document.createElement('span');
  meta.textContent = text;
  return meta;
}

function deleteTask(taskId) {
  tasks = tasks.filter(task => task.id !== taskId);
  saveTasks();
  displayTasks();
  schedulePendingNotifications();
}

function clearCompletedTasks() {
  const now = Date.now();
  tasks = tasks.filter(task => {
    const deadline = new Date(task.deadline).getTime();
    return deadline > now;
  });

  saveTasks();
  displayTasks();
  schedulePendingNotifications();
}

function schedulePendingNotifications() {
  reminderTimers.forEach(clearTimeout);
  reminderTimers = [];

  const permission = ('Notification' in window) ? Notification.permission : 'denied';

  tasks.forEach(task => {
    if (task.browserNotified && (!task.emailAddress || task.emailNotified)) {
      return;
    }

    const runAt = new Date(task.reminderTime).getTime();
    const delay = runAt - Date.now();

    if (delay <= 0) {
      checkPendingReminders();
      return;
    }

    reminderTimers.push(setTimeout(() => {
      handleReminder(task.id);
    }, delay));
  });
}

function checkPendingReminders() {
  tasks.forEach(task => {
    const runAt = new Date(task.reminderTime).getTime();
    if (runAt <= Date.now()) {
      handleReminder(task.id);
    }
  });
}

function handleReminder(taskId) {
  const task = tasks.find(item => item.id === taskId);
  if (!task) return;

  let changed = false;

  if (!task.browserNotified && settings.browserNotifications) {
    if ('Notification' in window && Notification.permission === 'granted') {
      triggerBrowserNotification(task);
      task.browserNotified = true;
      changed = true;
    } else if (!('Notification' in window) || Notification.permission === 'denied') {
      task.browserNotified = true;
      changed = true;
    }
  }

  if (task.emailAddress && !task.emailNotified && settings.emailReminders) {
    triggerEmailReminder(task);
  }

  if (changed) {
    saveTasks();
    displayTasks();
  }
}

function triggerBrowserNotification(task) {
  try {
    new Notification(`${task.title} is due soon`, {
      body: task.description || `Deadline: ${formatDateTime(task.deadline)}`,
      tag: `task-${task.id}`,
    });
  } catch (error) {
    console.warn('Unable to show browser notification:', error);
  }
}

async function triggerEmailReminder(task) {
  try {
    const response = await fetch(`${EMAIL_API_URL}/sendReminder`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: task.emailAddress,
        subject: `Reminder: ${task.title} is due soon`,
        message: `Your task "${task.title}" is scheduled for ${formatDateTime(task.deadline)}.

${task.description || 'No description provided.'}`,
      }),
    });

    if (response.ok) {
      task.emailNotified = true;
      saveTasks();
      displayTasks();
    } else {
      console.warn('Email reminder failed:', await response.text());
    }
  } catch (error) {
    console.warn('Email reminder error:', error);
  }
}

function sendTestEmail(task) {
  if (!task.emailAddress) {
    alert('Please configure an email address on this task first.');
    return;
  }

  triggerEmailReminder(task);
}

function formatDateTime(value) {
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    return 'Invalid date';
  }

  return date.toLocaleString([], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function escapeHtml(str){
    return String(str)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function escapeRegExp(string){
    return String(string).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlightHtml(text, query){
    if(!query) return escapeHtml(text);
    const q = escapeRegExp(query.trim());
    if(!q) return escapeHtml(text);
    const re = new RegExp(`(${q})`, 'ig');
    return escapeHtml(text).replace(re, '<mark class="highlight">$1</mark>');
}

