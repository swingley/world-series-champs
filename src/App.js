import React, { Component } from 'react';
import './App.css';
import IconCorrect from './baseline-check-24px'
import IconIncorrect from './baseline-close-24px'
import winners from './winners.json'
import teamAbbreviationLookup from './team-abbreviations'
import teamColors from './team-colors'

const noYankees = Object.keys(winners).reduce((accumulator, current) => {
  if ( !winners[current].toLowerCase().includes('yankees') ) {
    accumulator[current] = winners[current]
  }
  return accumulator
}, {})

class App extends Component {
  constructor() {
    super()
    const years = Object.keys(noYankees)
    const currentYear = this.pick(noYankees)
    this.state = {
      winners: noYankees,
      total: years.length,
      years,
      answer: '',
      currentYear,
      history: [],
      totalCorrect: 0,
      totalAsked: 0,
      multipleChoice: true,
      choices: this.generateChoices(currentYear, noYankees)
    }
  }
  render() {
    const { totalCorrect, totalAsked } = this.state
    const remaining = Object.keys(this.state.winners).length
    return (
      <div className="App">
        <div className="question">
          <p className="App-intro">
            Excluding the yankees, there have been {this.state.total} World Series winners.
          </p>

          {remaining > 0 &&
            <p>
              Who won in {this.state.currentYear}?
            </p>
          }
          {remaining === 0 &&
            <p>Finished...refresh to do it again!</p>
          }

          {!this.state.multipleChoice && remaining > 0 &&
            <span className="form-wrapper">
              <form
                action="."
                onSubmit={this.check.bind(this)}
              >
                <input
                  type="text"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  value={this.state.answer}
                  onChange={this.answerChanged.bind(this)}
                  ref={(input) => { this.answer = input }}
                />
                <button
                  type="submit"
                  onSubmit={this.check.bind(this)}
                  onClick={this.check.bind(this)}
                >
                  Submit
                </button>
              </form>
              <span className="results">{totalCorrect}/{totalAsked}</span>
            </span>
          }
          {this.state.multipleChoice &&
            <div>
              <div className="champ-choices" onClick={e => this.check(e)}>
                <div>
                  <button style={{ backgroundColor: teamColors[this.state.choices[0]] }}>{this.state.choices[0]}</button>
                  <button style={{ backgroundColor: teamColors[this.state.choices[1]] }}>{this.state.choices[1]}</button>
                </div>
                <div>
                  <button style={{ backgroundColor: teamColors[this.state.choices[2]] }}>{this.state.choices[2]}</button>
                  <button style={{ backgroundColor: teamColors[this.state.choices[3]] }}>{this.state.choices[3]}</button>
                </div>
              </div>
              <p><span className="results">{totalCorrect}/{totalAsked}</span></p>
            </div>
          }
          <p>
            {remaining} remaining
          </p>
          <p>
            <input
              type="checkbox"
              id="toggleMultipleChoice"
              onChange={e => this.toggleMultipleChoice(e)}
              checked={this.state.multipleChoice}
            />
            <label htmlFor="toggleMultipleChoice">Multiple choice? </label>
          </p>
        </div>

        <div className="history">
          {this.state.history && this.state.history.length > 0 &&
            <ul>
              {this.state.history.map((entry, index) => {
                const { team, year, correct } = entry
                const teamLogo  = teamAbbreviationLookup[team] || teamAbbreviationLookup.mlb
                return (
                  <li key={`winner-${index}`} className={correct ? 'correct' : 'incorrect' }>
                    {correct ? <IconCorrect /> : <IconIncorrect />}
                    <img className='team-logo' alt={`${team} logo`} src={teamLogo} />
                    <span>
                      {team} won in {year}
                    </span>
                  </li>
                )
              })}
            </ul>
          }
        </div>
      </div>
    );
  }

  pick(winners) {
    const availableWinners = Object.keys(winners)
    const position = Math.floor(Math.random() * availableWinners.length)
    const year = availableWinners[position]
    if ( this.answer ) this.answer.focus()
    return year
  }

  answerChanged(e) {
    this.setState({
      answer: e.target.value
    })
  }

  check(e) {
    if (e.target.tagName === 'DIV') {
      // only check if a button was clicked/tapped
      return
    }
    e.preventDefault()
    e.stopPropagation()
    const { winners, currentYear } = this.state
    const answer = (e.target.innerText === 'Submit') ? this.state.answer : e.target.innerText
    let { totalCorrect, totalAsked } = this.state
    const winner = winners[currentYear]
    const history = this.state.history.slice()
    let nextWinners = { ...this.state.winners }
    delete nextWinners[currentYear]
    let nextYear = this.pick(nextWinners)
    let nextChoices = this.generateChoices(nextYear)

    // console.log('winner and answer', winner, answer)
    const answerIsCorrect = answer.length && winner.toLowerCase().includes(answer.toLowerCase())
    history.unshift({
      team: winner,
      year: currentYear,
      correct: answerIsCorrect
    })
    totalAsked += 1
    if ( answerIsCorrect ) {
      totalCorrect += 1
    }
    e.target.blur()
    this.setState({
      answer: '',
      currentYear: nextYear,
      history,
      totalCorrect,
      totalAsked,
      winners: nextWinners,
      choices: nextChoices
    })
  }

  toggleMultipleChoice(e) {
    this.setState({ multipleChoice: e.target.checked })
  }

  generateChoices(current, winners) {
    const all = Object.values(winners || this.state.winners)
    const correct = (winners || this.state.winners)[current || this.state.currentYear]
    const uniques = []
    all.forEach(team => {
      if (team !== correct && team.indexOf('strike') === -1 && uniques.indexOf(team) === -1) {
        uniques.push(team)
      }
    })
    let shiftCount = Math.floor(Math.random() * uniques.length)
    while (shiftCount > 0) {
      uniques.push(uniques.shift())
      shiftCount -= 1
    }
    let choices = [
      uniques.pop(),
      uniques.pop(),
      uniques.pop(),
      correct
    ]
    let shiftChoices = Math.floor(Math.random() * choices.length)
    while (shiftChoices > 0) {
      choices.push(choices.shift())
      shiftChoices -= 1
    }
    return choices
  }
}

export default App;
