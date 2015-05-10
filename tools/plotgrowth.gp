# plot logistic function against time

lowerAsymptote = -0.9
upperAsymptote = 1.1
growthAsymptote = 0.5
growthRate = 1.4

logistic(lA, uA, g, gA, time) = lA + ((uA - lA) / ((1 + exp(-g*time))**(1/gA)))

set xrange[1:0]
set yrange[0:1]
# set zrange[-0.5:1.5]
set xlabel "tile yield"
set ylabel "population size"
set zlabel "growth"

set grid x
set grid y
set grid z

# plot logistic(lowerAsymptote, upperAsymptote, growthRate, growthAsymptote, x)

set terminal png size 800,600 enhanced 10
set output 'output.png'

splot logistic(lowerAsymptote, upperAsymptote, growthRate, growthAsymptote, (x + y)/2)