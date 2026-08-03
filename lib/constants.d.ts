interface Priority {
  PRIORITY_LOWEST: -2
  PRIORITY_BELOW_NORMAL: -1
  PRIORITY_NORMAL: 0
  PRIORITY_ABOVE_NORMAL: 1
  PRIORITY_HIGHEST: 2
}

interface constants {
  priority: Priority
}

export = constants
