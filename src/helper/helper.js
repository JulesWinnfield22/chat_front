function formatHoureAndMinuteTime(date) {
	date = new Date(date)
	let hours = date.getHours()
	let minutes = date.getMinutes()
	let ampm = hours >= 12 ? 'pm' : 'am'
	hours = hours % 12
	hours = hours ? hours : 12
	minutes = minutes.toString().padStart(2, '0')
	let strTime = hours + ':' + minutes + ' ' + ampm
	return strTime
}

function formatMessage(messages) {
	let createdAt = messages.reduce((set, message) => {
		set?.add(new Date(message.createdAt))
		return set
	}, new Set())

	let from = '', to = ''
	for(let i = 0; i < messages.length; i++) {
		from = messages[i].from
		to = messages[i].to
		break
	}

	createdAt = [...createdAt]

	let t = createdAt?.map(time => formatHoureAndMinuteTime(time))
	t = [...(new Set(t))]

	let m = []
	t?.map(time => {
		if(from != to) {
			let fFrom = '', fTo = '', fLast = false, fSeen
			let first = messages.filter(m => {
				let tt = formatHoureAndMinuteTime(m?.createdAt)
				if(tt == time && m.from == from) {
					fFrom = m.from
					fSeen = m.seen
					fTo = m.To
					if(!fLast) fLast = m.last ? true : undefined
					return true
				}	else return false
			})
			
			let sFrom = '', sTo = '', sLast = false, sSeen
			let second = messages.filter(m => {
				let tt = formatHoureAndMinuteTime(m?.createdAt)
				if(tt == time && m.from == to) {
					sFrom = m.from
					sTo = m.to
					sSeen = m.seen
					if(!sLast) sLast = m.last ? true : undefined
					return true
				}	else return false
			})

			// console.log(first, second, 'hallo')
		
			if(!first.length) {
				// delete second[0].message
				m.push({
					time,
					...second[0],
					seen: second.every(el => el.seen == true),
					messages: second
				})
			} else if(!second.length) {
				// delete first[0].message
				m.push({
					time,
					...first[0],
					seen: first.every(el => el.seen == true),
					messages: first
				})
			} 
			else {
				let fDate = new Date(first[0].createdAt), sDate = new Date(second[0].createdAt)
			
				if(fDate > sDate) {
					let temp = first
					first = second
					second = temp
				}
				
				// console.log(first, second,'what')
			
				for (let i = 0, j = 0; i < first.length;) {
					if (i + 1 < first.length) {
						sDate = new Date(second[j]?.createdAt)
						fDate = new Date(first[i]?.createdAt)
						let fDatePlusOne = new Date(first[i + 1]?.createdAt)
						if (sDate > fDate && sDate < fDatePlusOne) {
							let temp = m[m.length - 1]
							if(!temp) {
								// delete first[i].message
								m.push({
									time,
									...first[i],
									messages: [first[i]]
								})
							} else if(!temp?.messages?.find(m => m._id == first[i]._id)) {
								m.push({
									time,
									...first[i],
									messages: [first[i]]
								})
							}
							let me = second.filter((el) => new Date(el.createdAt) > fDate && new Date(el.createdAt) < fDatePlusOne)
							if(me.length > 0) {
								// delete second[i].message
								m.push({
									time,
									...me[me.length - 1],
									messages: me
								})
							}
							j += me.length
							// debugger
							i++
						} else {
							let k
							for (k = i + 1; k < first.length; k++) {
								if (sDate > new Date(first[k].createdAt) && sDate < new Date(first[k + 1]?.createdAt)) {
									break
								}
								continue
							}
				
							let mm = []
							for (let x = i; x <= k; x++) {
								if(first[x]) mm.push(first[x])
							}
							// mm.push(first[k])
							// debugger
							if(mm.length > 0) {
								// console.log(mm, 'mm')
								// delete mm[mm.length - 1].message
								m.push({
									time,
									...mm[mm.length - 1],
									messages: mm
								})
							}
				
							if (k + 1 > first.length) {
								let mm = second.filter(el => {
									return new Date(el.createdAt) > new Date(first[first.length - 1]?.createdAt)
								})
								if(mm.length > 0) {
									// delete mm[mm.length - 1].message
									m.push({
										time,
										...mm[mm.length - 1],
										messages: mm
									})
								}
							}
							i = k
						}
					}
					else {
						// delete first[i].message
						m.push({
							time,
							...first[i],
							messages: [first[i]]
						})
						let mm = second.filter((el, idx) => {
							return new Date(el.createdAt) > new Date(first[i].createdAt)
						})
						if(mm.length > 0) {
							// delete mm[mm.length - 1].message
							m.push({
								time,
								...second[i],
								...mm[mm.length - 1],
								messages: mm
							})
						}
			
						j += mm.length
						// debugger
						i++
					}
				}
				
			}

		} else {
			let seen, last
			let ms = messages.filter(m => {
				let tt = formatHoureAndMinuteTime(m?.createdAt)
				if(tt == time && m.from == from) {
					seen = m.seen
					if(!last) last = m.last ? true : undefined
					return true
				}	else return false
			})
			alert(JSON.stringify(ms))
			m.push({
				time: time,
				messages: ms,
				from,
				seen: ms.every(el => el.seen == true),
				to,
				last
			})
		}
	})

	return m
}

function formatMessagesByTime(messages) {
	if(messages) {
		let years =  messages?.reduce((set, message) => {
			set.add((new Date(message.createdAt)).getFullYear())
			return set
		}, new Set())

		years = [...years].sort((a, b) => a - b)
		let ms = []
		
		for(let i = 0; i < years.length; i++) {

			ms.push({
				year: years[i],
				messages: []
			})

			let months =  messages.reduce((set, message) => {
				set.add((new Date(message.createdAt)).getMonth() + 1) // the 1 is because JavaScripts getMonth starts counting from 0
				return set
			}, new Set())
			months = [...months].sort((a, b) => a - b)
      
      //alert('months => ' + JSON.stringify(months))
      
			for(let j = 0; j < months.length; j++) {

				ms[i].messages.push({
					month: months[j],
					messages: []
				})

				let dates =  messages.reduce((set, message) => {
					set.add((new Date(message.createdAt)).getDate())
					return set
				}, new Set())
				
        //alert('not sorted dates => ' + JSON.stringify([...dates]))
        
				if(navigator.userAgent.indexOf("Chrome") !== -1) {
					dates = [...dates].sort()
				} else {
					dates = [...dates].sort()
				}
				dates = [...dates].sort((a, b) => a - b)
        
        //alert('sorted dates => ' + JSON.stringify(dates))
        
				for(let k = 0; k < dates.length; k++) {

					let m = messages.filter(message => {
						let d = new Date(message.createdAt)
						return d.getDate() == dates[k] && d.getMonth() + 1 == months[j] && d.getFullYear() == years[i]
					})
          
          //alert("messages => " + JSON.stringify(m))
          
          if(m.length) {
  					ms[i].messages[j].messages.push({
  						date: dates[k],
  						messages: formatMessage(m.reverse())
  					})
          }

				} // end of K

			} // end of J

		} // end of I		

		return ms
	}
}

export {
	formatMessagesByTime,
	formatMessage,
	formatHoureAndMinuteTime
}