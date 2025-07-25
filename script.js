// Chart variables
        let erlangBChart = null;
        let erlangCChart = null;

        // Tab switching
        document.getElementById('erlangBTab').addEventListener('click', function() {
            switchTab('B');
        });

        document.getElementById('erlangCTab').addEventListener('click', function() {
            switchTab('C');
        });

        function switchTab(tab) {
            const bTab = document.getElementById('erlangBTab');
            const cTab = document.getElementById('erlangCTab');
            const bContent = document.getElementById('erlangBContent');
            const cContent = document.getElementById('erlangCContent');

            if (tab === 'B') {
                bTab.classList.add('tab-active');
                bTab.classList.remove('tab-inactive');
                cTab.classList.remove('tab-active');
                cTab.classList.add('tab-inactive');
                bContent.classList.remove('hidden');
                cContent.classList.add('hidden');
            } else {
                cTab.classList.add('tab-active');
                cTab.classList.remove('tab-inactive');
                bTab.classList.remove('tab-active');
                bTab.classList.add('tab-inactive');
                cContent.classList.remove('hidden');
                bContent.classList.add('hidden');
            }
        }

        // Mathematical functions
        function factorial(n) {
            if (n < 0) return NaN;
            if (n === 0 || n === 1) return 1;
            if (n > 170) return Infinity; // Prevent overflow
            let result = 1;
            for (let i = 2; i <= n; i++) {
                result *= i;
            }
            return result;
        }

        function calculateErlangB(A, N) {
            if (A <= 0 || N <= 0) return 0;
            
            // Use iterative approach to avoid factorial overflow
            let result = 1;
            for (let i = 1; i <= N; i++) {
                result = (result * A) / (i + result * A);
            }
            return result;
        }

        function calculateErlangC(A, N) {
            if (A >= N) return 1;
            if (A <= 0 || N <= 0) return 0;
            
            let sum = 0;
            for (let k = 0; k < N; k++) {
                sum += Math.pow(A, k) / factorial(k);
            }
            
            const numerator = Math.pow(A, N) / factorial(N);
            const denominator = numerator + (1 - A/N) * sum;
            
            if (denominator === 0) return 0;
            return numerator / denominator;
        }

        function calculateServiceLevel(Pw, A, N, targetTime, serviceTime) {
            if (N <= A) return { serviceLevel: 0, avgWaitTime: Infinity };
            
            const avgWaitTime = (Pw * serviceTime) / (N - A);
            const serviceLevel = 1 - Pw * Math.exp(-(N - A) * (targetTime / serviceTime));
            return { serviceLevel: Math.max(0, serviceLevel), avgWaitTime: Math.max(0, avgWaitTime) };
        }

        // Chart creation functions
        function createErlangBChart(traffic) {
            const ctx = document.getElementById('erlangBChart').getContext('2d');
            
            // Generate data points
            const channels = [];
            const blockingProbs = [];
            
            const maxChannels = Math.max(20, Math.ceil(traffic + 10));
            for (let n = 1; n <= maxChannels; n++) {
                channels.push(n);
                blockingProbs.push(calculateErlangB(traffic, n) * 100);
            }

            if (erlangBChart) {
                erlangBChart.destroy();
            }

            erlangBChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: channels,
                    datasets: [{
                        label: 'Blocking Probability (%)',
                        data: blockingProbs,
                        borderColor: 'rgb(59, 130, 246)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: 'rgb(59, 130, 246)',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 4
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top'
                        },
                        title: {
                            display: true,
                            text: `Traffic Intensity: ${traffic} Erlangs`
                        }
                    },
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'Number of Channels'
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Blocking Probability (%)'
                            },
                            beginAtZero: true
                        }
                    },
                    animation: {
                        duration: 1500,
                        easing: 'easeInOutQuart'
                    }
                }
            });
        }

        function createErlangCChart(traffic) {
            const ctx = document.getElementById('erlangCChart').getContext('2d');
            
            // Generate data points
            const agents = [];
            const serviceLevels = [];
            const waitingProbs = [];
            
            const minAgents = Math.ceil(traffic);
            const maxAgents = Math.max(minAgents + 15, 20);
            
            for (let n = minAgents; n <= maxAgents; n++) {
                agents.push(n);
                const Pw = calculateErlangC(traffic, n);
                const { serviceLevel } = calculateServiceLevel(Pw, traffic, n, 20, 180);
                serviceLevels.push(serviceLevel * 100);
                waitingProbs.push(Pw * 100);
            }

            if (erlangCChart) {
                erlangCChart.destroy();
            }

            erlangCChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: agents,
                    datasets: [{
                        label: 'Service Level (%)',
                        data: serviceLevels,
                        borderColor: 'rgb(34, 197, 94)',
                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                        borderWidth: 3,
                        fill: false,
                        tension: 0.4,
                        pointBackgroundColor: 'rgb(34, 197, 94)',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 4
                    }, {
                        label: 'Waiting Probability (%)',
                        data: waitingProbs,
                        borderColor: 'rgb(239, 68, 68)',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        borderWidth: 3,
                        fill: false,
                        tension: 0.4,
                        pointBackgroundColor: 'rgb(239, 68, 68)',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 4
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top'
                        },
                                                title: {
                            display: true,
                            text: `Traffic Intensity: ${traffic} Erlangs`
                        }
                    },
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'Number of Agents'
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Percentage (%)'
                            },
                            beginAtZero: true,
                            max: 100
                        }
                    },
                    animation: {
                        duration: 1500,
                        easing: 'easeInOutQuart'
                    }
                }
            });
        }
// Event listeners for calculations
        document.getElementById('calculateB').addEventListener('click', function() {
            const traffic = parseFloat(document.getElementById('trafficB').value);
            const channels = parseInt(document.getElementById('channelsB').value);
            
            if (isNaN(traffic) || isNaN(channels) || traffic <= 0 || channels <= 0) {
                alert('Please enter valid positive numbers for traffic intensity and channels.');
                return;
            }
            
            const blockingProb = calculateErlangB(traffic, channels);
            const gradeOfService = blockingProb;
            
            // Update results
            document.getElementById('blockingProb').textContent = (blockingProb * 100).toFixed(4) + '%';
            document.getElementById('gradeService').textContent = gradeOfService.toFixed(6);
            
            // Update interpretation
            let interpretation;
            const blockingPercent = blockingProb * 100;
            
            if (blockingPercent < 1) {
                interpretation = `Excellent performance! Only ${blockingPercent.toFixed(4)}% of calls are blocked. The system has adequate capacity for the current traffic load.`;
            } else if (blockingPercent < 5) {
                interpretation = `Good performance with ${blockingPercent.toFixed(4)}% blocking probability. This is within acceptable limits for most applications.`;
            } else if (blockingPercent < 10) {
                interpretation = `Moderate blocking at ${blockingPercent.toFixed(4)}%. Consider adding more channels to improve service quality.`;
            } else {
                interpretation = `High blocking probability of ${blockingPercent.toFixed(4)}%! Additional channels are strongly recommended to meet service requirements.`;
            }
            
            document.getElementById('interpretationB').textContent = interpretation;
            
            // Show results with animation
            const resultCard = document.getElementById('resultB');
            resultCard.classList.add('show');
            
            // Create chart
            createErlangBChart(traffic);
            
            // Show chart container
            document.getElementById('chartContainerB').style.display = 'block';
        });

        document.getElementById('calculateC').addEventListener('click', function() {
            const traffic = parseFloat(document.getElementById('trafficC').value);
            const agents = parseInt(document.getElementById('agentsC').value);
            const targetTime = parseFloat(document.getElementById('targetTime').value);
            const serviceTime = parseFloat(document.getElementById('serviceTime').value);
            
            if (isNaN(traffic) || isNaN(agents) || isNaN(targetTime) || isNaN(serviceTime) || 
                traffic <= 0 || agents <= 0 || targetTime <= 0 || serviceTime <= 0) {
                alert('Please enter valid positive numbers for all parameters.');
                return;
            }
            
            if (traffic >= agents) {
                alert('Warning: Traffic intensity should be less than the number of agents for stable operation.');
            }
            
            const waitingProb = calculateErlangC(traffic, agents);
            const { serviceLevel, avgWaitTime } = calculateServiceLevel(waitingProb, traffic, agents, targetTime, serviceTime);
            const utilization = traffic / agents;
            
            // Update results
            document.getElementById('waitingProb').textContent = (waitingProb * 100).toFixed(2) + '%';
            document.getElementById('serviceLevel').textContent = (serviceLevel * 100).toFixed(2) + '%';
            document.getElementById('avgWaitTime').textContent = avgWaitTime.toFixed(1) + 's';
            document.getElementById('agentUtilization').textContent = (utilization * 100).toFixed(1) + '%';
            
            // Update interpretation
            let interpretation;
            const serviceLevelPercent = serviceLevel * 100;
            const utilizationPercent = utilization * 100;
            
            if (serviceLevelPercent >= 95) {
                interpretation = `Excellent service level of ${serviceLevelPercent.toFixed(1)}%! Customers experience minimal wait times with ${utilizationPercent.toFixed(1)}% agent utilization.`;
            } else if (serviceLevelPercent >= 80) {
                interpretation = `Good service level at ${serviceLevelPercent.toFixed(1)}%. Agent utilization is ${utilizationPercent.toFixed(1)}% - consider optimizing staffing.`;
            } else if (serviceLevelPercent >= 60) {
                interpretation = `Moderate service level of ${serviceLevelPercent.toFixed(1)}%. Consider adding agents to improve customer experience.`;
            } else {
                interpretation = `Poor service level at ${serviceLevelPercent.toFixed(1)}%! Additional agents are urgently needed to meet service targets.`;
            }
            
            document.getElementById('interpretationC').textContent = interpretation;
            
            // Show results with animation
            const resultCard = document.getElementById('resultC');
            resultCard.classList.add('show');
            
            // Create chart
            createErlangCChart(traffic);
            
            // Show chart container
            document.getElementById('chartContainerC').style.display = 'block';
        });

        // Input validation and real-time feedback
        function addInputValidation() {
            const inputs = document.querySelectorAll('input[type="number"]');
            
            inputs.forEach(input => {
                input.addEventListener('input', function() {
                    if (this.value < 0) {
                        this.style.borderColor = '#ef4444';
                        this.style.backgroundColor = 'rgba(254, 226, 226, 0.9)';
                    } else {
                        this.style.borderColor = '';
                        this.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                    }
                });
                
                input.addEventListener('keypress', function(e) {
                    if (e.key === 'Enter') {
                        if (this.id.includes('B')) {
                            document.getElementById('calculateB').click();
                        } else {
                            document.getElementById('calculateC').click();
                        }
                    }
                });
            });
        }

        // Initialize tooltips and help text
        function initializeTooltips() {
            const tooltipElements = document.querySelectorAll('[data-tooltip]');
            
            tooltipElements.forEach(element => {
                element.addEventListener('mouseenter', function() {
                    const tooltip = this.getAttribute('data-tooltip');
                    // Create tooltip element (simplified)
                    const tooltipDiv = document.createElement('div');
                    tooltipDiv.className = 'tooltip';
                    tooltipDiv.textContent = tooltip;
                    document.body.appendChild(tooltipDiv);
                });
            });
        }

        // Export results function
        function exportResults(type) {
            let data = '';
            const timestamp = new Date().toISOString();
            
            if (type === 'B') {
                const traffic = document.getElementById('trafficB').value;
                const channels = document.getElementById('channelsB').value;
                const blockingProb = document.getElementById('blockingProb').textContent;
                const gradeService = document.getElementById('gradeService').textContent;
                
                data = `Erlang B Calculation Results\n`;
                data += `Generated: ${timestamp}\n\n`;
                data += `Parameters:\n`;
                data += `Traffic Intensity: ${traffic} Erlangs\n`;
                data += `Number of Channels: ${channels}\n\n`;
                data += `Results:\n`;
                data += `Blocking Probability: ${blockingProb}\n`;
                data += `Grade of Service: ${gradeService}\n`;
            } else {
                const traffic = document.getElementById('trafficC').value;
                const agents = document.getElementById('agentsC').value;
                const targetTime = document.getElementById('targetTime').value;
                const serviceTime = document.getElementById('serviceTime').value;
                const waitingProb = document.getElementById('waitingProb').textContent;
                const serviceLevel = document.getElementById('serviceLevel').textContent;
                const avgWaitTime = document.getElementById('avgWaitTime').textContent;
                const utilization = document.getElementById('agentUtilization').textContent;
                
                data = `Erlang C Calculation Results\n`;
                data += `Generated: ${timestamp}\n\n`;
                data += `Parameters:\n`;
                data += `Traffic Intensity: ${traffic} Erlangs\n`;
                data += `Number of Agents: ${agents}\n`;
                data += `Target Answer Time: ${targetTime}s\n`;
                data += `Service Time: ${serviceTime}s\n\n`;
                data += `Results:\n`;
                data += `Waiting Probability: ${waitingProb}\n`;
                data += `Service Level: ${serviceLevel}\n`;
                data += `Average Wait Time: ${avgWaitTime}\n`;
                data += `Agent Utilization: ${utilization}\n`;
            }
            
            // Create and download file
            const blob = new Blob([data], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `erlang_${type.toLowerCase()}_results.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }

        // Initialize everything when DOM is loaded
        document.addEventListener('DOMContentLoaded', function() {
            addInputValidation();
            initializeTooltips();
            
            // Hide chart containers initially
            document.getElementById('chartContainerB').style.display = 'none';
            document.getElementById('chartContainerC').style.display = 'none';
            
            // Add export buttons (optional)
            const exportBtnB = document.createElement('button');
            exportBtnB.className = 'mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors';
            exportBtnB.innerHTML = '<i class="fas fa-download mr-2"></i>Export Results';
            exportBtnB.onclick = () => exportResults('B');
            
            const exportBtnC = document.createElement('button');
            exportBtnC.className = 'mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors';
            exportBtnC.innerHTML = '<i class="fas fa-download mr-2"></i>Export Results';
            exportBtnC.onclick = () => exportResults('C');
            
            // Add export buttons to result cards
            document.getElementById('resultB').appendChild(exportBtnB);
            document.getElementById('resultC').appendChild(exportBtnC);
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', function(e) {
            if (e.ctrlKey || e.metaKey) {
                if (e.key === '1') {
                    e.preventDefault();
                    switchTab('B');
                } else if (e.key === '2') {
                    e.preventDefault();
                    switchTab('C');
                }
            }
        });

        // Responsive chart resize
        window.addEventListener('resize', function() {
            if (erlangBChart) {
                erlangBChart.resize();
            }
            if (erlangCChart) {
                erlangCChart.resize();
            }
        });