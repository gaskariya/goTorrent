import React from 'react';
import ReactDOM from 'react-dom';
import styles from '../node_modules/react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';

import {
    SortingState, LocalSorting, PagingState, VirtualTableLayout, SelectionState, FilteringState,
} from '@devexpress/dx-react-grid';

import {
    Grid, TableView, TableHeaderRow, PagingPanel, VirtualTableView, TableSelection, TableColumnResizing,
    DragDropContext, TableColumnReordering,
} from '@devexpress/dx-react-grid-material-ui';

import { ProgressBarCell } from './ProgressBarCell';
//react redux
import {connect} from 'react-redux';
import * as actionTypes from './store/actions';


/* var torrentLinkSubmit = document.getElementById('torrentLinkSubmit');
var magnetLink = document.getElementById('magnetLink');
var myTextArea = document.getElementById("loggerData");
var torrentHash = document.getElementById("hash");
initialize an empty torrents field before update.
 var torrentLinkSubmit = document.getElementById('torrentLinkSubmit');
var magnetLink = document.getElementById('magnetLink');
var myTextArea = document.getElementById("loggerData");
var torrentHash = document.getElementById("hash");
var torrentLinkSubmit = document.getElementById('torrentLinkSubmit');
var torrentLinkModal = document.getElementById('addTorrentLinkModal');
var btnTorrentLink = document.getElementById("addTorrentLink"); 
*/



function sendEvent(message)
{
    ws.send(message);
    console.log('Sending message... ', message)
}

class TorrentListTable extends React.Component {
    
    constructor(props) {
        super(props);
        this.state = { //rows are stored in redux they are sent over from the server
            columns: [
                { name: 'TorrentName', title: 'Torrent Name' },
                { name: 'DownloadedSize', title: 'Dl Size'},
                { name: 'Size', title: 'Size'},
                { name: 'PercentDone', title: 'Percent Done'},
                { name: 'Status', title: 'Status'},
                { name: 'DownloadSpeed', title: 'DL Speed'},
                { name: 'UploadSpeed', title: 'UL Speed'},
                { name: 'ActivePeers', title: 'Active Peers' },
                { name: 'ETA', title: 'ETA'},
                { name: 'Ratio', title: 'Ratio'},
                { name: 'Availability', title: 'Availability'},
            ],
            columnOrder: ['TorrentName', 'DownloadedSize', 'Size', 'PercentDone', 'Status', 'DownloadSpeed', 'UploadSpeed','ActivePeers', 'ETA', 'Ratio', 'Availability'],
            columnWidths: {TorrentName: 250, DownloadedSize: 100, Size: 100, PercentDone: 175, Status: 150, DownloadSpeed: 100, UploadSpeed: 100, ActivePeers: 100, ETA: 100, Ratio: 75, Availability: 75},
            prevSelection: [], //just used to pull data from cell (temp Prevcell holder), real selection is in Redux
        };
 
        this.changeColumnOrder = columnOrder => this.setState({columnOrder});
        this.changeColumnWidths = columnWidths => this.setState({columnWidths});
    }



    componentWillReceiveProps (nextProps){  //this is for setting the filter when the left menu activates a new filter
        if (this.props.filter != nextProps.filter){
            this.filterHandler(nextProps.filter)
        }
    }


    determineSelectionHashes = (selectedRows) => {
        console.log("CurrentSelectionHashes", this.props.selectionHashes)
        let selectionHashes = [] //rebuilding our selection hashes from our currently selected rows
        selectedRows.forEach(element => {
            selectionHashes.push(element.TorrentHashString) //push the selection hash to the temp array
        })
        this.props.sendSelectionHashes(selectionHashes) //push the result to redux
    }


    determineButtonState = (selectedRows) => { //TODO run a filter to corrently determing button status... currently broken
        selectedRows.forEach(element => {
            if (element.Status === "Downloading" || "Awaiting Peers" || "Seeding") {
                let buttonState = [{startButton: "default", stopButton: "primary", deleteButton: "accent", fSeedButton: "default", fRecheckButton: "primary"}]
                this.props.setButtonState(buttonState)
            } else if (element.Status === "Completed")  {
                let buttonState = [{startButton: "default", stopButton: "default", deleteButton: "accent", fSeedButton: "primary", fRecheckButton: "primary"}]
                this.props.setButtonState(buttonState)
            } else {
                this.props.setButtonState(this.props.buttonStateDefault)
            }
        });
    }

    changeSelection = (selection) => {
        this.props.changeSelection(selection) //dispatch selection to redux, also clear out anything tied to the old selection (peerlists, filelists, etc)

        if (selection.length === 0) { //if selection is empty buttons will be default and selectionHashes will be blanked out and pushed to redux
            this.props.setButtonState(this.props.buttonStateDefault) //if no selection dispatch that to redux
            //let selectionHashes = []
            //this.props.sendSelectionHashes(selectionHashes) //clearning out selection hashes since we have nothing selected
        } else { // if we have selection continue on with logic to determine button state
            const selectedRows = [] //array of all the selected Rows
            selection.forEach(element => {   
                selectedRows.push(this.props.torrentList[element])   //pushing the selected rows out of torrentlist
            });
            this.determineButtonState(selectedRows) //running a filter on the rows to determing buttonState
            this.determineSelectionHashes(selectedRows) //pulling the torrent hashes for the selcted rows
        } 
       
    }

    filterHandler = (filter) => { //TODO, figure out how to do multiple filter
        console.log("Changing FIlter", filter)
        if (filter.value ==="Active"){
            console.log("This filter doesn't fucking work")
        }
    }


    render() {
        return (   
            <Grid rows={this.props.torrentList} columns={this.state.columns}>
                <SortingState sorting={this.props.sorting} onSortingChange={this.props.changeSorting} />
                <LocalSorting />
                <FilteringState filters={this.props.filter} />
                <SelectionState onSelectionChange={this.changeSelection} selection={this.props.selection}/> 
                <TableView  tableCellTemplate={({ row, column, style }) => {
                    if (column.name === 'PercentDone') {
                    return (
                        <ProgressBarCell value={row.PercentDone * 100} style={style} />
                    );
                    }
                    return undefined;
                }}/>
                <DragDropContext />
                <TableColumnResizing columnWidths={this.state.columnWidths} onColumnWidthsChange={this.changeColumnWidths}/>
                <TableColumnReordering order={this.state.columnOrder} onOrderChange={this.changeColumnOrder} />
                <TableSelection selectByRowClick highlightSelected />
                <TableHeaderRow allowSorting allowResizing allowDragging />
            </Grid>
        );
    }
}

const mapStateToProps = state => {
    return {
        filter: state.filter,
        torrentList: state.torrentList,
        buttonState: state.buttonState,
        buttonStateDefault: state.buttonStateDefault, //all default
        selectionHashes: state.selectionHashes,
    };
  }

const mapDispatchToProps = dispatch => {
    return {
        changeSorting: (sorting) => dispatch({type: actionTypes.SORTLIST, sorting }),
        changeSelection: (selection) => dispatch({type: actionTypes.CHANGE_SELECTION, selection}),
        setButtonState: (buttonState) => dispatch({type: actionTypes.SET_BUTTON_STATE, buttonState}),
        sendSelectionHashes: (selectionHashes) => dispatch({type: actionTypes.SELECTION_HASHES, selectionHashes}),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(TorrentListTable);